const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "pass",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);

function start() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Exit",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.choice) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Exit":
          console.log("Goodbye!");
          db.end();
          break;
      }
    });
}

const viewDepartments = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const viewRoles = () => {
  db.query("SELECT * FROM role", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const viewEmployees = () => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
      },
    ])
    .then((answer) => {
      db.query(
        "INSERT INTO department (department_name) VALUES (?)",
        [answer.name],
        (err, result) => {
          if (err) throw err;
          console.log("Department added");
          start();
        }
      );
    });
};

const addRole = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the role:",
        },
        {
          type: "input",
          name: "description",
          message: "Enter the description of the role:",
        },
        {
          type: "list",
          name: "department",
          message: "Select the department of the role:",
          choices: results.map((department) => department.department_name),
        },
      ])
      .then((answer) => {
        const departmentId = results.find(
          (department) => department.department_name === answer.department
        ).id;
        db.query(
          "INSERT INTO role (title, description, department_id) VALUES (?, ?, ?)",
          [answer.title, answer.description, departmentId],
          (err, results) => {
            if (err) throw err;
            console.log(
              `New role '${answer.title}' has been added successfully!`
            );
            start();
          }
        );
      });
  });
};


const addEmployee = () => {
  db.query("SELECT * FROM role", (err, roles) => {
    if (err) throw err;
    db.query("SELECT * FROM employees", (err, employees) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "Enter the employee's first name:",
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter the employee's last name:",
          },
          {
            type: "list",
            name: "role_id",
            message: "Select the employee's role:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: "list",
            name: "manager_id",
            message: "Select the employee's manager:",
            choices: [
              { name: "None", value: null },
              ...employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
              })),
            ],
          },
        ])
        .then((answer) => {
          db.query(
            "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
            [answer.first_name, answer.last_name, answer.role_id, answer.manager_id],
            (err, result) => {
              if (err) throw err;
              console.log("Employee added");
              start();
            }
          );
        });
    });
  });
};

start();
