import { RdbmsSessionStorageMigrator } from '@shopify/shopify-app-session-storage';

class PostgresSessionStorageMigrator extends RdbmsSessionStorageMigrator {
    constructor(dbConnection, opts = {}, migrations) {
        super(dbConnection, opts, migrations);
    }
    async initMigrationPersistence() {
        const migration = `
      CREATE TABLE IF NOT EXISTS ${this.options.migrationDBIdentifier} (
        ${this.getOptions().migrationNameColumnName} varchar(255) NOT NULL PRIMARY KEY
    );`;
        await this.connection.query(migration, []);
    }
}

export { PostgresSessionStorageMigrator };
//# sourceMappingURL=postgres-migrator.mjs.map
