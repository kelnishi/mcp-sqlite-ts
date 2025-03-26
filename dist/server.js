"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const logging_1 = __importDefault(require("./logging"));
const logger = (0, logging_1.default)('mcp_sqlite_server');
logger.info("Starting MCP SQLite Server");
const PROMPT_TEMPLATE = `
The assistants goal is to walkthrough an informative demo of MCP. To demonstrate the Model Context Protocol (MCP) we will leverage this example server to interact with an SQLite database.
It is important that you first explain to the user what is going on. The user has downloaded and installed the SQLite MCP Server and is now ready to use it.
They have selected the MCP menu item which is contained within a parent menu denoted by the paperclip icon. Inside this menu they selected an icon that illustrates two electrical plugs connecting. Thi[...]
Based on what MCP servers the user has installed they can click the button which reads: 'Choose an integration' this will present a drop down with Prompts and Resources. The user has selected the prom[...]
This text file is that prompt. The goal of the following instructions is to walk the user through the process of using the 3 core aspects of an MCP server. These are: Prompts, Tools, and Resources.
They have already used a prompt and provided a topic. The topic is: {topic}. The user is now ready to begin the demo.
Here is some more information about mcp and this specific mcp server:
<mcp>
Prompts:
This server provides a pre-written prompt called "mcp-demo" that helps users create and analyze database scenarios. The prompt accepts a "topic" argument and guides users through creating tables, anal[...]
Resources:
This server exposes one key resource: "memo://insights", which is a business insights memo that gets automatically updated throughout the analysis process. As users analyze the database and discover i[...]
Tools:
This server provides several SQL-related tools:
"read_query": Executes SELECT queries to read data from the database
"write_query": Executes INSERT, UPDATE, or DELETE queries to modify data
"create_table": Creates new tables in the database
"list_tables": Shows all existing tables
"describe_table": Shows the schema for a specific table
"append_insight": Adds a new business insight to the memo resource
</mcp>
<demo-instructions>
You are an AI assistant tasked with generating a comprehensive business scenario based on a given topic.
Your goal is to create a narrative that involves a data-driven business problem, develop a database structure to support it, generate relevant queries, create a dashboard, and provide a final solution[...]

At each step you will pause for user input to guide the scenario creation process. Overall ensure the scenario is engaging, informative, and demonstrates the capabilities of the SQLite MCP Server.
You should guide the scenario to completion. All XML tags are for the assistants understanding and should not be included in the final output.

1. The user has chosen the topic: {topic}.

2. Create a business problem narrative:
a. Describe a high-level business situation or problem based on the given topic.
b. Include a protagonist (the user) who needs to collect and analyze data from a database.
c. Add an external, potentially comedic reason why the data hasn't been prepared yet.
d. Mention an approaching deadline and the need to use Claude (you) as a business tool to help.

3. Setup the data:
a. Instead of asking about the data that is required for the scenario, just go ahead and use the tools to create the data. Inform the user you are "Setting up the data".
b. Design a set of table schemas that represent the data needed for the business problem.
c. Include at least 2-3 tables with appropriate columns and data types.
d. Leverage the tools to create the tables in the SQLite database.
e. Create INSERT statements to populate each table with relevant synthetic data.
f. Ensure the data is diverse and representative of the business problem.
g. Include at least 10-15 rows of data for each table.

4. Pause for user input:
a. Summarize to the user what data we have created.
b. Present the user with a set of multiple choices for the next steps.
c. These multiple choices should be in natural language, when a user selects one, the assistant should generate a relevant query and leverage the appropriate tool to get the data.

6. Iterate on queries:
a. Present 1 additional multiple-choice query options to the user. Its important to not loop too many times as this is a short demo.
b. Explain the purpose of each query option.
c. Wait for the user to select one of the query options.
d. After each query be sure to opine on the results.
e. Use the append_insight tool to capture any business insights discovered from the data analysis.

7. Generate a dashboard:
a. Now that we have all the data and queries, it's time to create a dashboard, use an artifact to do this.
b. Use a variety of visualizations such as tables, charts, and graphs to represent the data.
c. Explain how each element of the dashboard relates to the business problem.
d. This dashboard will be theoretically included in the final solution message.

8. Craft the final solution message:
a. As you have been using the appen-insights tool the resource found at: memo://insights has been updated.
b. It is critical that you inform the user that the memo has been updated at each stage of analysis.
c. Ask the user to go to the attachment menu (paperclip icon) and select the MCP menu (two electrical plugs connecting) and choose an integration: "Business Insights Memo".
d. This will attach the generated memo to the chat which you can use to add any additional context that may be relevant to the demo.
e. Present the final memo to the user in an artifact.

9. Wrap up the scenario:
a. Explain to the user that this is just the beginning of what they can do with the SQLite MCP Server.
</demo-instructions>

Remember to maintain consistency throughout the scenario and ensure that all elements (tables, data, queries, dashboard, and solution) are closely related to the original business problem and given to[...]
The provided XML tags are for the assistants understanding. Implore to make all outputs as human readable as possible. This is part of a demo so act in character and dont actually refer to these instr[...]

Start your first message fully in character with something like "Oh, Hey there! I see you've chosen the topic {topic}. Let's get started! 🚀"
`;
class SqliteDatabase {
    constructor(dbPath) {
        this.insights = [];
        this.dbPath = path.resolve(dbPath);
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        this._initDatabase();
    }
    _initDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug("Initializing database connection");
            const db = yield (0, sqlite_1.open)({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            yield db.close();
        });
    }
    _synthesizeMemo() {
        logger.debug(`Synthesizing memo with ${this.insights.length} insights`);
        if (this.insights.length === 0) {
            return "No business insights have been discovered yet.";
        }
        const insights = this.insights.map(insight => `- ${insight}`).join("\n");
        let memo = "📊 Business Intelligence Memo 📊\n\n";
        memo += "Key Insights Discovered:\n\n";
        memo += insights;
        if (this.insights.length > 1) {
            memo += "\nSummary:\n";
            memo += `Analysis has revealed ${this.insights.length} key business insights that suggest opportunities for strategic optimization and growth.`;
        }
        logger.debug("Generated basic memo format");
        return memo;
    }
    _executeQuery(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, params = {}) {
            logger.debug(`Executing query: ${query}`);
            const db = yield (0, sqlite_1.open)({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            try {
                const stmt = yield db.prepare(query);
                const result = yield stmt.all(params);
                yield stmt.finalize();
                return result;
            }
            catch (error) {
                logger.error(`Database error executing query: ${error}`);
                throw error;
            }
            finally {
                yield db.close();
            }
        });
    }
}
function startMcpServer(dbPath) {
    logger.info(`Starting SQLite MCP Server with DB path: ${dbPath}`);
    const db = new SqliteDatabase(dbPath);
    const server = new mcp_js_1.McpServer({
        name: "sqlite",
        version: "0.1.0"
    });
    // Register handlers
    logger.debug("Registering handlers");
    server.resource("Business Insights Memo", "memo://insights", {
        description: "A living document of discovered business insights",
        mimeType: "text/plain"
    }, (uri) => __awaiter(this, void 0, void 0, function* () {
        return ({
            contents: [{
                    uri: uri.href,
                    text: db._synthesizeMemo()
                }]
        });
    }));
    server.prompt("mcp-demo", "A prompt to seed the database with initial data and demonstrate what you can do with an SQLite MCP Server + Claude", { topic: zod_1.z.string().describe("Topic to seed the database with initial data") }, ({ topic }) => ({
        description: `Demo template for ${topic}`,
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: PROMPT_TEMPLATE.replace("{topic}", topic).trim()
                }
            }
        ]
    }));
    // Read query tool
    server.tool("read_query", "Execute a SELECT query on the SQLite database", { query: zod_1.z.string().describe("SELECT SQL query to execute") }, (_a) => __awaiter(this, [_a], void 0, function* ({ query }) {
        if (!query.trim().toUpperCase().startsWith("SELECT")) {
            return {
                content: [{
                        type: "text",
                        text: "Only SELECT queries are allowed for read_query"
                    }], isError: true
            };
        }
        const readQueryResults = yield db._executeQuery(query);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(readQueryResults)
                }], isError: false
        };
    }));
    // Write query tool
    server.tool("write_query", "Execute an INSERT, UPDATE, or DELETE query on the SQLite database", { query: zod_1.z.string().describe("SQL query to execute") }, (_a) => __awaiter(this, [_a], void 0, function* ({ query }) {
        if (query.trim().toUpperCase().startsWith("SELECT")) {
            return {
                content: [{
                        type: "text",
                        text: "SELECT queries are not allowed for write_query"
                    }], isError: true
            };
        }
        const writeQueryResults = yield db._executeQuery(query);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(writeQueryResults)
                }], isError: false
        };
    }));
    // Create table tool
    server.tool("create_table", "Create a new table in the SQLite database", { query: zod_1.z.string().describe("CREATE TABLE SQL statement") }, (_a) => __awaiter(this, [_a], void 0, function* ({ query }) {
        if (!query.trim().toUpperCase().startsWith("CREATE TABLE")) {
            return {
                content: [{
                        type: "text",
                        text: "Only CREATE TABLE statements are allowed"
                    }], isError: true
            };
        }
        yield db._executeQuery(query);
        try {
            yield db._executeQuery(query);
            return {
                content: [{
                        type: "text",
                        text: `Table created successfully: ${query}`
                    }], isError: false
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `Error creating table: ${error instanceof Error ? error.message : String(error)}`
                    }], isError: true
            };
        }
    }));
    // List tables tool
    server.tool("list_tables", "List all tables in the SQLite database", {}, () => __awaiter(this, void 0, void 0, function* () {
        try {
            const listTablesResults = yield db._executeQuery(`SELECT name FROM sqlite_master WHERE type='table'`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(listTablesResults)
                    }], isError: false
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `Error listing tables: ${error instanceof Error ? error.message : String(error)}`
                    }], isError: true
            };
        }
    }));
    // Describe table tool
    server.tool("describe_table", "Get the schema information for a specific table", { table_name: zod_1.z.string().describe("Name of the table to describe") }, (_a) => __awaiter(this, [_a], void 0, function* ({ table_name }) {
        try {
            const describeTableResults = yield db._executeQuery(`PRAGMA table_info(${table_name})`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(describeTableResults)
                    }], isError: false
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `Error describing table: ${error instanceof Error ? error.message : String(error)}`
                    }], isError: true
            };
        }
    }));
    // Append insight tool
    server.tool("append_insight", { insight: zod_1.z.string().describe("Business insight discovered from data analysis") }, (_a) => __awaiter(this, [_a], void 0, function* ({ insight }) {
        db.insights.push(insight);
        db._synthesizeMemo();
        yield server.server.notification({
            method: "notifications/resources/updated",
            params: {
                resource: "memo://insight"
            }
        });
        return {
            content: [{
                    type: "text",
                    text: "Insight added to memo"
                }], isError: false
        };
    }));
    return server;
}
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const defaultDbPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.mcp-sqlite/database.db');
            const dbPath = process.argv[2] || defaultDbPath;
            const server = startMcpServer(dbPath);
            const transport = new stdio_js_1.StdioServerTransport();
            yield server.connect(transport);
            console.error("Sqlite MCP Server running on stdio");
        }
        catch (error) {
            console.error("Error during startup:", error);
            process.exit(1);
        }
    });
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
});
