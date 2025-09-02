USE bmpde3nqhk7fj6wky6ge;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    last_name VARCHAR(45),
    age INT,
    email VARCHAR(45),
    password VARCHAR(45)
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id)
);

CREATE TABLE tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    mode_tutoring VARCHAR(45),
    hour_price DECIMAL(10,2),
    description_tutor VARCHAR(45),
    FOREIGN KEY (users_id) REFERENCES users(id)
);

CREATE TABLE tutor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutors_id INT,
    FOREIGN KEY (tutors_id) REFERENCES tutors(id),
    days_availability SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
    start_availability TIME,
    end_availability TIME
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(45),
    tutors_id INT,
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE students_subjects (
    students_id INT,
    subjects_id INT,
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (subjects_id) REFERENCES subjects(id)
);

CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    students_id INT,
    tutors_id INT,
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    chats_id INT,
    FOREIGN KEY (chats_id) REFERENCES chats(id)
);

CREATE TABLE reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_date DATE,
    tutors_id INT,
    students_id INT,
    subjects_id INT,
    FOREIGN KEY (subjects_id) REFERENCES subjects(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id),
    FOREIGN KEY (students_id) REFERENCES students(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    students_id INT,
    tutors_id INT,
    comments TEXT,
    ranking ENUM('1','2','3','4','5'),
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    tutor_id INT,
    status ENUM('pending','accepted','rejected'),
    message TEXT
);

INSERT INTO users (name, last_name, age, email, password) VALUES
('Juan', 'Pérez', 20, 'juan.perez@example.com', '12345'),
('María', 'López', 22, 'maria.lopez@example.com', '123');

INSERT INTO users (name, last_name, age, email, password) VALUES
('Carlos', 'Ramírez', 30, 'carlos.ramirez@example.com', '2025'),
('Ana', 'Torres', 28, 'ana.torres@example.com', '5656'),
('Laura', 'Martínez', 35, 'laura.martinez@example.com', '7789');

INSERT INTO students (users_id) VALUES
(1),  -- Juan
(2);  -- María

INSERT INTO tutors (users_id, mode_tutoring, hour_price, description_tutor) VALUES
(3, 'Online', 50.00, 'Tutor de JS'),
(4, 'Presencial', 60.00, 'Tutor de HTML5'),
(5, 'Online', 70.00, 'Tutor de CSS');
