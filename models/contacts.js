const fs = require('fs/promises')
const path = require('path');
const {v4} = require('uuid');

const contactsPath = path.join(__dirname, "contacts.json");

const updateContactJson = async (contacts) => {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
}

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
}

const getContactById = async (contactId) => {
  const contacts = await listContacts ();
  const result = contacts.find(item => item.id === contactId);
  console.log(contactId)
  if (!result) {
    return null;
  };
  return result;
}

const removeContact = async (contactId) => {
  const contacts = await listContacts ();
  const deleteContact = contacts.find(item => item.id === contactId);
  if (!deleteContact) {
    return null;
  };
  const newContacts = contacts.filter(item => item.id !== contactId);
  await updateContactJson(newContacts);
  return deleteContact;
}

const addContact = async ( name, email, phone ) => {
  const contacts = await listContacts ();
  const newContact = { id: v4(), name, email, phone };
  contacts.push(newContact);
  await updateContactJson(contacts);
  return newContact;
}

const updateContact = async (id, body) => {
  const contacts = await listContacts ();
  const idx = contacts.findIndex(item => item.id === id);
  if(idx === -1) {
    return null;
  };
  console.log(idx)
  contacts[idx] = {...body, id};
  await updateContactJson(contacts);
  return contacts[idx];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
