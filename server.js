const express = require("express");
// Import and require mysql2
const mysql = require("mysql2");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "",
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
          "Update an employee role",
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
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Quit":
          console.log("Goodbye!");
          connection.end();
          break;
      }
    });
}

const viewDepartments = () => {
  db.query("SELECT * FROM departments", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const viewRoles = () => {
  db.query("SELECT * FROM roles", (err, results) => {
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
        "INSERT INTO departments SET ?",
        { name: answer.name },
        (err, result) => {
          if (err) throw err;
          console.log("Department added");
          start();
        }
      );
    });
};

const addRole = () => {
  db.query("SELECT * FROM departments", (err, results) => {
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
          name: "salary",
          message: "Enter the salary of the role:",
        },
        {
          type: "list",
          name: "department",
          message: "Select the department of the role:",
          choices: results.map((department) => department.name),
        },
      ])
      .then((answer) => {
        const departmentId = results.find(
          (department) => department.name === answer.department
        ).id;
        db.query(
          "INSERT INTO roles SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: departmentId,
          },
          (err, result) => {
            if (err) throw err;
            console.log("Role added");
            start();
          }
        );
      });
  });
};

const addEmployee = () => {
  db.query("SELECT * FROM roles", (err, roles) => {
    if (err) throw err;
    db.query("SELECT * FROM employees", (err, employees) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "Enter the employee's first name:",
          },
          {
            type: "input",
            name: "lastName",
            message: "Enter the employee's last name:",
          },
          {
            type: "list",
            name: "roleId",
            message: "Choose the employee's role:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: "list",
            name: "managerId",
            message: "Choose the employee's manager:",
            choices: employees.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
        ])
        .then((answer) => {
          db.query(
            "INSERT INTO employees SET ?",
            {
              first_name: answer.firstName,
              last_name: answer.lastName,
              role_id: answer.roleId,
              manager_id: answer.managerId,
            },
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

const updateEmployeeRole = () => {
  // Prompt user to select employee to update
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;
    const employees = results.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Select employee to update:",
          choices: employees,
        },
      ])
      .then((employeeAnswer) => {
        // Prompt user to select new role for employee
        db.query("SELECT * FROM roles", (err, results) => {
          if (err) throw err;
          const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "roleId",
                message: "Select new role for employee:",
                choices: roles,
              },
            ])
            .then((roleAnswer) => {
              // Update employee's role in the database
              db.query(
                "UPDATE employees SET role_id = ? WHERE id = ?",
                [roleAnswer.roleId, employeeAnswer.employeeId],
                (err, result) => {
                  if (err) throw err;
                  console.log("Employee role updated");
                  start();
                }
              );
            });
        });
      });
  });
};

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
