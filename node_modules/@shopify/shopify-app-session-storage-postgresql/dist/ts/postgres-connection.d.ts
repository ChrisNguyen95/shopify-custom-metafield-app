import { RdbmsConnection } from '@shopify/shopify-app-session-storage';
export declare class PostgresConnection implements RdbmsConnection {
    sessionStorageIdentifier: string;
    private ready;
    private pool;
    private dbUrl;
    constructor(dbUrl: string, sessionStorageIdentifier: string);
    query(query: string, params?: any[]): Promise<any[]>;
    /**
     * Runs a series of queries in a transaction - requires the use of a SINGLE client,
     * hence we can't use the query method above.
     *
     * @param queries an array of SQL queries to execute in a transaction
     */
    transaction(queries: string[]): Promise<void>;
    disconnect(): Promise<void>;
    connect(): Promise<void>;
    getDatabase(): string | undefined;
    hasTable(tablename: string): Promise<boolean>;
    getArgumentPlaceholder(position: number): string;
    private init;
}
//# sourceMappingURL=postgres-connection.d.ts.map