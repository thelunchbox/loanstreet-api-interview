const prompts = require('prompts');
const fetch = require('node-fetch');

try {
  require('dotenv').config();
} catch (ex) {
  console.warn('no environment variables loaded from .env');
}

const { API_HOST } = process.env;

const COMMANDS = {
  ADD: 'add',
  GET: 'get',
  UPDATE: 'update',
};

const properties = [
  {
    type: 'number',
    name: 'amount',
    message: 'Loan Amount',
    min: 0,
  },
  {
    type: 'number',
    name: 'interestRate',
    message: 'Interest Rate (as a percentage)',
    min: 0,
    max: 100,
  },
  {
    type: 'number',
    name: 'term',
    message: 'Length of Loan (in months)',
    min: 0,
  },
  {
    type: 'number',
    name: 'payment',
    message: 'Monthly Payment Amount',
    min: 0,
  },
];

const addLoan = async () => {
  const loanDetails = await prompts(properties);

  const response = await fetch(`${API_HOST}/api/loan`, {
    method: 'POST',
    body: JSON.stringify(loanDetails),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
}

const getLoan = async () => {
  const { id } = await prompts({
    type: 'text',
    name: 'id',
    message: 'ID of loan to get',
  });

  const response = await fetch(`${API_HOST}/api/loan/${id}`);
  const loan = await response.json();
}

const updateLoan = async () => {

  const { id, keys } = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID of loan to update',
    },
    {
      type: 'multiselect',
      name: 'key',
      message: 'Which fields would you like to update?',
      choices: [
        { title: 'Loan Amount', value: 'amount' },
        { title: 'Interest Rate', value: 'interestRate' },
        { title: 'Length of Loan', value: 'term' },
        { title: 'Monthly Payment Amount', value: 'payment' },
      ],
    },
  ]);

  const valuePrompts = properties.filter((property) => keys.includes(property.name));
  const loanDetails = await prompts(valuePrompts);

  const response = await fetch(`${API_HOST}/api/loan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(loanDetails),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mainLoop = async () => {
  const { command } = await prompts({
    type: 'select',
    name: 'command',
    message: 'What would you like to do?',
    choices: [
      { title: 'Add Loan', value: COMMANDS.ADD },
      { title: 'Get Loan', value: COMMANDS.GET },
      { title: 'Update Loan', value: COMMANDS.UPDATE },
    ],
  });

  switch(command) {
    case COMMANDS.ADD:
      await addLoan();
      break;
    case COMMANDS.GET:
      await getLoan();
      break;
    case COMMANDS.UPDATE:
      await updateLoan();
      break;
  }
  setImmediate(mainLoop); // so we don't add to the call stack
};

mainLoop();