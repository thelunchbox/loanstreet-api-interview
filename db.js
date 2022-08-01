const updateDatabase = async (pool) => {
  await pool.query(`CREATE TABLE IF NOT EXISTS loan (
    id varchar(36) NOT NULL,
    amount decimal NOT NULL,
    interest_rate decimal NOT NULL,
    term integer NOT NULL,
    payment decimal NOT NULL,
    PRIMARY KEY (id) 
  )`)
};

module.exports = {
  updateDatabase,
};
