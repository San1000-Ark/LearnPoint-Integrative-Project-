
USE bac1o7wnszeodfemghmg;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
full_name VARCHAR(45),
age INT,
email VARCHAR(45),
password VARCHAR(45),
registration_date DATE);

ALTER TABLE users CHANGE full_name name VARCHAR(45);
ALTER TABLE users ADD COLUMN last_name VARCHAR(45);

SELECT * FROM users;

CREATE TABLE students(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id),
academic_level VARCHAR(50));

CREATE TABLE tutors(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id),
mode_tutoring VARCHAR(45),
hour_price VARCHAR(45),
description_tutor VARCHAR(45),
is_verified ENUM ('TRUE','FALSE'));

CREATE TABLE tutor_availability(
id INT AUTO_INCREMENT PRIMARY KEY,
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id),
date_availability DATE,
time_availability TIME);

CREATE TABLE subjects(
id INT AUTO_INCREMENT PRIMARY KEY,
subject_name VARCHAR(45),
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE students_subjects (
students_id INT,
subjects_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
FOREIGN KEY (subjects_id) REFERENCES subjects(id));

CREATE TABLE chats(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE chat_messages(
id INT AUTO_INCREMENT PRIMARY KEY,
message TEXT,
chats_id INT,
FOREIGN KEY (chats_id) REFERENCES chats(id));

CREATE TABLE reservation(
id INT AUTO_INCREMENT PRIMARY KEY,
reservation_date DATE,
tutor_availability_id INT,
FOREIGN KEY (tutor_availability_id) REFERENCES tutor_availability(id),
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
subjects_id INT,
FOREIGN KEY (subjects_id) REFERENCES subjects(id));

CREATE TABLE reviews(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
tutors_id INT,
FOREIGN KEY (tutors_id ) REFERENCES tutors(id),
tutors_users_id INT,
FOREIGN KEY (tutors_users_id) REFERENCES tutors(users_id),
comments TEXT,
ranking ENUM('1','2','3','4','5'));

=======
USE bac1o7wnszeodfemghmg;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
full_name VARCHAR(45),
age INT,
email VARCHAR(45),
password VARCHAR(45),
registration_date DATE);

CREATE TABLE students(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id),
academic_level VARCHAR(50));

CREATE TABLE tutors(
id INT AUTO_INCREMENT PRIMARY KEY,
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id),
mode_tutoring VARCHAR(45),
hour_price VARCHAR(45),
description_tutor VARCHAR(45),
is_verified ENUM ('TRUE','FALSE'));

CREATE TABLE tutor_availability(
id INT AUTO_INCREMENT PRIMARY KEY,
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id),
date_availability DATE,
time_availability TIME);

CREATE TABLE subjects(
id INT AUTO_INCREMENT PRIMARY KEY,
subject_name VARCHAR(45),
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE students_subjects (
students_id INT,
subjects_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
FOREIGN KEY (subjects_id) REFERENCES subjects(id));

CREATE TABLE chats(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
tutors_id INT,
FOREIGN KEY (tutors_id) REFERENCES tutors(id));

CREATE TABLE chat_messages(
id INT AUTO_INCREMENT PRIMARY KEY,
message TEXT,
chats_id INT,
FOREIGN KEY (chats_id) REFERENCES chats(id));

CREATE TABLE reservation(
id INT AUTO_INCREMENT PRIMARY KEY,
reservation_date DATE,
tutor_availability_id INT,
FOREIGN KEY (tutor_availability_id) REFERENCES tutor_availability(id),
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
subjects_id INT,
FOREIGN KEY (subjects_id) REFERENCES subjects(id));

CREATE TABLE reviews(
id INT AUTO_INCREMENT PRIMARY KEY,
students_id INT,
FOREIGN KEY (students_id) REFERENCES students(id),
tutors_id INT,
FOREIGN KEY (tutors_id ) REFERENCES tutors(id),
tutors_users_id INT,
FOREIGN KEY (tutors_users_id) REFERENCES tutors(users_id),
comments TEXT,
ranking ENUM('1','2','3','4','5'));


SHOW TABLES;