const db = require('./config/connection.js');
const inquirer = require('inquirer');
const connection = require('./config/connection.js');

function init() {
    showConnect();
}

showConnect = () => {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE TRACKER         *")
    console.log("*                                 *")
    console.log("***********************************")
    userPrompt();
};

function userPrompt() {
  inquirer
    .prompt([
      {
      type: 'list',
      name: 'choices',
      message: 'What would you like to do?',
      choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                "Update an Employee's Role",
                "Update an Employee's Manager",
                "Delete Department",
                "Delete Role",
                "Delete Employee",
                "View Employees by Manager",
                "View Employees by Role",
                "View Employees by Department",
                "View Department Budget",
                'End prompt'
              ]
        }
    ])
      .then(function (data) {
        switch (data.choices) {
          case "View All Departments":
              getDepartments();
            break;
          case "View All Roles":
              getRoles();
            break;
          case "View All Employees":
              getEmployees();
            break;
          case "Add a Department":
              addDepartment();
            break;
          case "Add a Role":
              addRole();
            break;
          case "Add an Employee":
              addEmployee();
            break;
          case "Update an Employee's Role":
              updateEmployeeRole();
            break;
          case "Update an Employee's Manager":
              updateEmployeeManager();
            break;
          case "Delete Department":
              deleteDepartment();
            break;
          case "Delete Role":
              deleteRole();
            break;
          case "Delete Employee":
              deleteEmployee();
            break;
          case "View Employees by Manager":
              viewManager();
            break;
          case "View Employees by Role":
              viewRole();
            break;
          case "View Employees by Department":
              viewDepartment();
            break;
          case "View Department Budget":
              viewBudget();
            break;
          case "End prompt":
              connection.end();
            break;
        }
    });
};

function getDepartments() {
  const sql = `SELECT department.id, department.name AS department FROM department`;
  db.query(sql, (err, results) => {
    if (err) throw err;

    const transformed = results.reduce((acc, {
      id,
      ...x
    }) => {
      acc[id] = x;
      return acc
    }, {});
    console.table(transformed);
    userPrompt();
  })
}

function getRoles() {
  const sql = `SELECT role.id, role.title, department.name AS department, role.salary
                FROM role JOIN department ON role.department_id = department.id`;
  db.query(sql, (err, result) => {
    if (err) throw err;

    const transformed = result.reduce((acc, {
      id,
      ...i
    }) => {
      acc[id] = i;
      return acc
    }, {});
    console.table(transformed);
    userPrompt();
  })
}

function getEmployees() {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title,
                        department.name AS department, role.salary, manager.last_name AS manager
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id;`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    const transformed = results.reduce((acc, {
      id,
      ...x
    }) => {
      acc[id] = x;
      return acc
    }, {});
    console.table(transformed);
    userPrompt();
  })
}

function addDepartment() {
  inquirer.prompt([{
    type: 'input',
    name: 'department',
    message: 'What department would you like to add?',
    validate: input => {
      if (input && input.length <= 30) {
        return true;
      } else {
        return false;
      }
    }
  }]).then(function (data) {

    db.query(`INSERT INTO department (name) VALUES ('${data.department}')`, (err) => {
      if (err) throw err;

      userPrompt();
    });
  });
}

function addRole() {

  db.query(`Select department.name FROM department`, (err, results) => {
    if (err) throw err;

    let departmentArray = [];

    for (let i = 0; i < results.length; i++) {
      departmentArray.push(results[i].name)
    }

    inquirer.prompt([{
      type: 'input',
      name: 'role',
      message: 'What role would you like to add?',
      validate: input => {
        if (input && input.length <= 30) {
          return true;
        } else {
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What salary would this role have?',
      validate: input => {
        if (isNaN(input)) {
          return false;
        } else {
          return true;
        }
      }
    },
    {
      type: 'list',
      name: 'department',
      message: 'What department is this role apart of?',
      choices: departmentArray
    }
    ]).then(function (data) {
        db.query(`SELECT * FROM department WHERE  name = '${data.department}'`, (err, results) => {
          if (err) throw err;

        db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${data.role}', '${data.salary}', '${results[0].id}')`, (err) => {
          if (err) throw err;

          userPrompt();
        });
      });
    });
  });
}

function addEmployee() {
  db.query(`SELECT role.title FROM role`, (err, data1) => {
    if (err) throw err;

    let roleArray = [];

    for (let i = 0; i < data1.length; i++) {
      roleArray.push(data1[i].title)
    }

    db.query(`SELECT employee.first_name, employee.last_name FROM employee`, (err, data2) => {
      if (err) throw err;

      let managerArray = ['No Manager'];

      for (let i = 0; i < data2.length; i++) {
        let manager = `${data2[i].first_name} ${data2[i].last_name}`
        managerArray.push(manager)
      }

      inquirer.prompt([{
        type: 'input',
        name: 'firstName',
        message: "What is the first name of your new employee?",
        validate: input => {
          if (input && input.length <= 30) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the last name of your new employee?",
        validate: input => {
          if (input && input.length <= 30) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'role',
        message: "What is the role of your new Employee?",
        choices: roleArray
      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is your new employee's manager?",
        choices: managerArray
      }
      ]).then(function (data3) {
        let firstname = data3.firstName;
        firstname = firstname.replace(/\s+/g, '-');

        let lastname = data3.lastName;
        lastname = lastname.replace(/\s+/g, '-');

        let managername = data3.manager;
        let sql1 = `SELECT id FROM role WHERE title = '${data3.role}'`
        if (managername != 'No Manager') {
          managername = managername.split(" ");
          let managerfirstname = managername[0];
          let managerlastname = managername[1];
          sql1 = `SELECT id FROM role WHERE title = '${data3.role}' UNION SELECT id FROM employee WHERE first_name = '${managerfirstname}' AND last_name = '${managerlastname}'`
        }

        db.query(sql1, (err, data4) => {
          if (err) throw err;

          let sql2 = '';
          if (data4.length === 1 && managername === 'No Manager') {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}', null)`
          } else if (data4.length === 1) {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}','${data4[0].id}')`
          } else {
            sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                VALUES ('${firstname}','${lastname}','${data4[0].id}','${data4[1].id}')`
          }
          db.query(sql2, (err) => {
            if (err) throw err;

            userPrompt();
          });
        });
      });
    });
  });
}

function updateEmployeeRole() {
  db.query(`SELECT employee.first_name, employee.last_name FROM employee`, (err, data1) => {
    if (err) throw err;

    let employeeArray = [];

    for (let i = 0; i < data1.length; i++) {
      let employee = `${data1[i].first_name} ${data1[i].last_name}`
      employeeArray.push(employee)
    }

    inquirer.prompt([{
      type: 'list',
      name: 'employee',
      message: "Which employee would you like to update their role?",
      choices: employeeArray
    }]).then(function (data2) {
      let employeename = data2.employee;
      employeename = employeename.split(" ");
      let employeefirstname = employeename[0];
      let employeelastname = employeename[1];

      db.query(`SELECT role.title FROM role`, (err, data3) => {
        if (err) throw err;

        let roleArray = [];

        for (let i = 0; i < data3.length; i++) {
          let role = data3[i].title
          roleArray.push(role)
        }

        inquirer.prompt([{
          type: 'list',
          name: 'role',
          message: "What role would you like the employee to have?",
          choices: roleArray
        }]).then(function (results) {

          db.query(`SELECT id FROM role WHERE title = '${results.role}'`, (err, moreresult) => {
            if (err) throw err;

            const sql = `UPDATE employee  
                        SET role_id = '${moreresult[0].id}'
                        WHERE first_name = '${employeefirstname}' AND last_name ='${employeelastname}'`;

            db.query(sql, (err) => {
              if (err) throw err;
              userPrompt();
            });
          });
        });
      });
    });
  });
}

function updateEmployeeManager() {
  db.query('SELECT first_name, last_name FROM employee', (err, data1) => {
    if (err) throw err;

    let employeeArray = [];

    for (let i = 0; i < data1.length; i++) {
      let employee = `${data1[i].first_name} ${data1[i].last_name}`

      employeeArray.push(employee);
    }
    inquirer.prompt([{
      type: 'list',
      name: 'employee',
      message: 'Which employee do you want to update manager?',
      choices: employeeArray
    }]).then(function (data2) {
      let employee = data2.employee;
      employee = employee.split(" ");

      let employeefirstname = employee[0];
      let employeelastname = employee[1]

      employeeArray.push('No Manager');

      inquirer.prompt([{
        type: 'list',
        name: 'manager',
        message: `Who is the employee's new manager?`,
        choices: employeeArray
      }]).then(function (data3) {
        let manager = data3.manager;
        manager = manager.split(" ");
        let managerfirstname = manager[0];
        let managerlastname = manager[1];

        const sql = `UPDATE employee
                    SET manager_id = null
                    WHERE first_name = '${employeefirstname}' AND last_name = '${employeelastname}'`
        if (manager[0] != 'No' && manager[1] != 'Manager') {
          sql = `SELECT id FROM employee WHERE first_name = '${managerfirstname}' AND last_name = '${managerlastname}'`
        }

        db.query(sql, (err, data4) => {
          if (err) throw err;

          if (manager[0] === 'No' && manager[1] === 'Manager') {
            userPrompt();
          } else {
            const managerId = data4[0].id;

            let employeeUpdate = `UPDATE employee
                                SET manager_id = ${managerId}
                                WHERE first_name = '${employeefirstname}' AND last_name = '${employeelastname}'`

            db.query(employeeUpdate, (err) => {
              if (err) throw err;

              userPrompt();
            })
          }
        })
      })
    });
  });
}

function deleteDepartment() {
  db.query('SELECT name FROM department', (err, data1) => {
    if (err) throw err;

    let deptArray = [];

    for (let i = 0; i < data1.length; i++) {
      let department = data1[i].name;

      deptArray.push(department);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'department',
      message: 'Which department would you like to remove?',
      choices: deptArray
    }])
    .then(function (data2) {
      let department = data2.department;

      const sql = `DELETE FROM department WHERE name = "${department}"`

      db.query(sql, (err) => {
        if (err) throw err;

        userPrompt();
      });
    });
  });
}

function deleteRole() {
  db.query('SELECT title FROM role', (err, data1) => {
    if (err) throw err;

    let roleArray = [];

    for (let i = 0; i < data1.length; i++) {
      let role = data1[i].title;

      roleArray.push(role);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'role',
      message: 'Which role would you like to remove?',
      choices: roleArray
    }])
    .then(function (data2) {
      let role = data2.role;

      const sql = `DELETE FROM role WHERE title = "${role}"`

      db.query(sql, (err) => {
        if (err) throw err;

        userPrompt();
      });
    });
  });
}

function deleteEmployee() {
  db.query('SELECT first_name, last_name FROM employee', (err, data1) => {
    if (err) throw err;
    let employeeArray = [];

    for (let i = 0; i < data1.length; i++) {
      let employee = `${data1[i].first_name} ${data1[i].last_name}`;

      employeeArray.push(employee);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'employee',
      message: 'Which employee would you like to remove?',
      choices: employeeArray
    }])
    .then(function (data2) {
      let employee = data2.employee;
      employee = employee.split(" ");
      employeefirstname = employee[0];
      employeelastname = employee[1];

      const sql = `DELETE FROM employee WHERE first_name = "${employeefirstname}" AND last_name = "${employeelastname}"`

      db.query(sql, (err) => {
        if (err) throw err;

        userPrompt();
      });
    });
  });
}

function viewManager() {
  db.query('Select manager_id from employee', (err, data1) => {
    if (err) throw err

    let managerIdArray = []

    for (let i = 0; i < data1.length; i++) {
      managerId = data1[i].manager_id;
      managerIdArray.push(managerId);
    }

    managerIdArray = [...new Set(managerIdArray)];
    managerIdArray = managerIdArray.filter((n) => n);

    let sqlText = `WHERE id = '${managerIdArray[0]}' `

    for (let i = 1; i < managerIdArray.length; i++) {
      sqlText += `OR id = '${managerIdArray[i]}' `
    }

    db.query(`SELECT first_name, last_name FROM employee ${sqlText}`, (err, data2) => {
      if (err) throw err;

      let managerArray = [];

      for (let i = 0; i < data2.length; i++) {
        let manager = `${data2[i].first_name} ${data2[i].last_name}`;
        managerArray.push(manager);
      }

      inquirer.prompt([{
        type: 'list',
        name: 'manager',
        message: 'Which manager whould you like to see the employee list?',
        choices: managerArray
      }])
        .then(function (data3) {
          let manager = data3.manager;
          manager = manager.split(" ");
          let managerfirstname = manager[0];
          let managerlastname = manager[1];

          const sql1 = `Select id FROM employee WHERE first_name = "${managerfirstname}" OR last_name = "${managerlastname}"`
          db.query(sql1, (err, data4) => {
            if (err) throw err;
            let managerID = data4[0].id

            const sql2 = `SELECT id, first_name, last_name FROM employee WHERE manager_id = ${managerID}`
            db.query(sql2, (err, data5) => {
              if (err) throw err;

              const transformed = data5.reduce((acc, {
                id,
                ...x
              }) => {
                acc[id] = x;
                return acc
              }, {});
              console.log(`Employee list of the ${data3.manager} :`)
              console.table(transformed);

              userPrompt();
            })
          })
        })
    });
  })
}

function viewRole() {
  db.query("Select title FROM role", (err, data1) => {
    if (err) throw err;

    let roleArray = [];

    for (let i = 0; i < data1.length; i++) {
      let role = data1[i].title;

      roleArray.push(role)
    }

    inquirer.prompt([{
      type: 'list',
      name: 'role',
      message: 'What role would you like to see an employee list?',
      choices: roleArray
    }]).then(function (data2) {
      const role = data2.role
      db.query(`SELECT id FROM role WHERE title = '${role}'`, (err, data3) => {
        if (err) throw err;

        const id = data3[0].id;

        db.query(`SELECT id, first_name, last_name FROM employee WHERE role_id = ${id}`, (err, data4) => {
          if (err) throw err;

          const transformed = data4.reduce((acc, {
            id,
            ...x
          }) => {
            acc[id] = x;
            return acc
          }, {});
          console.log(`Employee list of ${role}:`)
          console.table(transformed);

          userPrompt();
        })
      })
    })
  })
}

function viewDepartment() {
  db.query('SELECT name FROM department', (err, data1) => {
    let deptArray = [];

    for (let i = 0; i < data1.length; i++) {
      let department = data1[i].name;

      deptArray.push(department);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'department',
      message: 'Which department do you want to see employees?',
      choices: deptArray
    }]).then(function (data2) {
      const department = data2.department;

      db.query(`SELECT id FROM department WHERE name = '${department}'`, (err, data3) => {
        let deptId = data3[0].id;

        db.query(`SELECT id FROM role WHERE department_id = ${deptId}`, (err, data4) => {
          if (err) throw err;

          let sqlText = `WHERE employee.role_id = '${data4[0].id}' `


          for (let i = 1; i < data4.length; i++) {
            sqlText += `OR employee.role_id = '${data4[i].id}' `
          }

          const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary
                                FROM employee JOIN role ON employee.role_id = role.id ${sqlText} `
          db.query(sql, (err, data5) => {
            if (err) throw err;

            const transformed = data5.reduce((acc, {
              id,
              ...x
            }) => {
              acc[id] = x;
              return acc
            }, {});
            console.log(`Employee list of the ${department} Department:`)
            console.table(transformed);

            userPrompt();
          })
        })
      });
    });
  });
}

function viewBudget() {
  db.query('SELECT name FROM department', (err, data1) => {
    let deptArray = [];

    for (let i = 0; i < data1.length; i++) {
      let department = data1[i].name;

      deptArray.push(department);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'department',
      message: 'Which department budget would you like to see?',
      choices: deptArray
    }]).then(function (data2) {
      const department = data2.department;

      db.query(`SELECT id FROM department WHERE name = '${department}'`, (err, data3) => {
        let deptId = data3[0].id;

        db.query(`SELECT id FROM role WHERE department_id = ${deptId}`, (err, data4) => {
          if (err) throw err;

          let sqlText = `WHERE employee.role_id = '${data4[0].id}' `


          for (let i = 1; i < data4.length; i++) {
            sqlText += `OR employee.role_id = '${data4[i].id}' `
          }

          const sql = `SELECT employee.id, role.salary FROM employee
                                JOIN role ON employee.role_id = role.id ${sqlText}`
          db.query(sql, (err, data5) => {
            if (err) throw err;

            let deptSalary = 0;

            for (let i = 0; i < data5.length; i++) {
              const salary = parseInt(data5[i].salary)
              deptSalary = deptSalary + salary;
            }
            console.log(`Here is the budget of the ${department} Department is $${deptSalary}.`)
            userPrompt();
          });
        });
      });
    });
  });
}

db.connect(err => {
  if (err) throw err;
  console.log()
})

init();