/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id').primary(); // Serial PK
            table.string('login_id', 12).notNullable().unique();
            table.string('email').notNullable().unique();
            table.string('password_hash').notNullable();
            table.timestamps(true, true); // created_at, updated_at
        })
        .createTable('otp_tokens', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.string('otp', 6).notNullable();
            table.timestamp('expires_at').notNullable();
            table.boolean('used').defaultTo(false);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('otp_tokens').dropTableIfExists('users');
};
