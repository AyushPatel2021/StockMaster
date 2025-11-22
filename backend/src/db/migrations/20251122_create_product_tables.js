/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('categories', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.text('description');
            table.timestamps(true, true);
        })
        .createTable('products', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('sku').notNullable().unique();
            table.text('description');
            table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
            table.decimal('price', 14, 2).defaultTo(0);
            table.decimal('cost', 14, 2).defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable('inventory', function (table) {
            table.increments('id').primary();
            table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
            table.integer('location_id').unsigned().notNullable().references('id').inTable('locations').onDelete('CASCADE');
            table.integer('quantity').defaultTo(0);
            table.integer('min_quantity').defaultTo(0); // Reordering rule
            table.unique(['product_id', 'location_id']);
            table.timestamps(true, true);
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('inventory')
        .dropTableIfExists('products')
        .dropTableIfExists('categories');
};
