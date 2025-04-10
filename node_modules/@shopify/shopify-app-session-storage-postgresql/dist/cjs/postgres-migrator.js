'use strict';

var shopifyAppSessionStorage = require('@shopify/shopify-app-session-storage');

class PostgresSessionStorageMigrator extends shopifyAppSessionStorage.RdbmsSessionStorageMigrator {
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

exports.PostgresSessionStorageMigrator = PostgresSessionStorageMigrator;
//# sourceMappingURL=postgres-migrator.js.map
