import { MigrationOperation } from '@shopify/shopify-app-session-storage';
import { PostgresConnection } from './postgres-connection';
export declare const migrationList: MigrationOperation[];
export declare function migrateScopeFieldToVarchar1024(connection: PostgresConnection): Promise<void>;
export declare function migrateToCaseSensitivity(connection: PostgresConnection): Promise<void>;
//# sourceMappingURL=migrations.d.ts.map