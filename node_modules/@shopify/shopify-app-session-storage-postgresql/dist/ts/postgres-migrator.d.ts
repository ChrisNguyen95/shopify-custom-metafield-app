import { RdbmsSessionStorageMigrator, RdbmsSessionStorageMigratorOptions, MigrationOperation } from '@shopify/shopify-app-session-storage';
import { PostgresConnection } from './postgres-connection';
export declare class PostgresSessionStorageMigrator extends RdbmsSessionStorageMigrator {
    constructor(dbConnection: PostgresConnection, opts: Partial<RdbmsSessionStorageMigratorOptions> | undefined, migrations: MigrationOperation[]);
    initMigrationPersistence(): Promise<void>;
}
//# sourceMappingURL=postgres-migrator.d.ts.map