USE employees_db;

INSERT INTO department (department_name)
VALUES ('Engineering'),
       ('Marketing'),
       ('HR'); 

INSERT INTO role (title, description, department_id)
VALUES ('Software Engineer', 'Responsible for SW products', 1), 
        ('Marketing Manager', 'Responsible for marketing products', 2),
        ('HR Manager', 'Responsible for human resources', 3);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ('John', 'Smith', 1),
        ('Jane', 'Williams', 2),
        ('Mary', 'Brown', 3);       
