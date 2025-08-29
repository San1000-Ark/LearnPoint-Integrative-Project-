USE blalusmsbbi2n2nbu7fh;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
last_name VARCHAR(45),
age INT,
email VARCHAR(45),
password VARCHAR(45));

CREATE TABLE students(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id));

CREATE TABLE tutors(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
mode_tutoring VARCHAR(45),
hour_price DECIMAL(10,2),
description_tutor VARCHAR(200),
FOREIGN KEY (users_id) REFERENCES users(id));

CREATE TABLE tutor_availability(
id INT AUTO_INCREMENT PRIMARY KEY,
tutors_id INT,
days_availability SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
start_availability TIME,
end_availability TIME,
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE subjects(
id INT AUTO_INCREMENT PRIMARY KEY,
subject_name VARCHAR(45));

/*CREATE TABLE chats(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
tutors_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE chat_messages(
id INT AUTO_INCREMENT PRIMARY KEY,
message TEXT,
chats_id INT,
FOREIGN KEY (chats_id) REFERENCES chats(id));*/

CREATE TABLE reservation(
id INT AUTO_INCREMENT PRIMARY KEY,
start_datetime DATETIME,
end_datetime DATETIME,
tutors_id INT,
students_id INT,
subjects_id INT,
jitsi_link VARCHAR(255),
FOREIGN KEY (subjects_id) REFERENCES subjects(id),
FOREIGN KEY (tutors_id) REFERENCES tutors(id),
FOREIGN KEY (students_id) REFERENCES students(id)
);

CREATE TABLE reviews(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
tutors_id INT,
comments TEXT,
ranking ENUM('1','2','3','4','5'),
FOREIGN KEY (students_id) REFERENCES students(id),
FOREIGN KEY (tutors_id ) REFERENCES tutors(id));

CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  tutor_id INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  message TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (tutor_id ) REFERENCES tutors(id));