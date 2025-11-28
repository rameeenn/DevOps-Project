require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");

let con;

async function connectWithRetry() {
  let connected = false;
  while (!connected) {
    try {
      con = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      console.log("Connected to MySQL!");
      connected = true;
    } catch (err) {
      console.log("MySQL not ready");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

connectWithRetry();

// Establish MySQL connection
mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})
    .then((connection) => {
        con = connection;
        console.log("Connected to MySQL database!");
    })
    .catch((err) => {
        console.error("Error connecting to MySQL:", err);
    });

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/appointments/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "SELECT A.appointment_id ,DATE_FORMAT(A.appointment_date, '%Y-%m-%d') AS appointment_date,U.full_name,A.appointment_time,A.room_id,A.status FROM Appointments A INNER JOIN Doctors D ON A.doctor_id=D.doctor_id Inner Join Users U on D.user_id=U.user_id where A.patient_id=?";
        const [rows] = await con.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/labs/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "SELECT l.labtest_id,l.test_type,DATE_FORMAT(l.test_date,'%Y-%m-%d') AS test_date,l.test_time FROM LabTests l join LabReports b on l.labtest_id=b.labtest_id where l.patient_id=? and b.result='N/A'";
        const [rows] = await con.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/doctor/:id", async (req, res) => {
    try {
        const aId = req.params.id;
        const query = "Select d.start_time,d.end_time from Doctors d join Appointments a on d.doctor_id=a.doctor_id where a.appointment_id=?";
        const [row] = await con.query(query, [aId]);
        res.json(row[0]);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/doctors/:id", async (req, res) => {
    try {
        const aId = req.params.id;
        const query = "Select start_time,end_time from Doctors where doctor_id=?";
        const [row] = await con.query(query, [aId]);
        res.json(row[0]);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/profiles/:id", async (req, res) => {
    try {
        const pid = req.params.id;
        const query = "Select DATE_FORMAT(u.date_of_birth, '%Y-%m-%d') AS date_of_birth,u.full_name,u.email,u.contact_number,u.password,p.status from Users u join Patients p on u.user_id=p.user_id where p.patient_id=?";
        const [row] = await con.query(query, [pid]);
        res.json(row[0]);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});
app.get("/lprofiles/:id", async (req, res) => {
    try {
        const pid = req.params.id;
        const query = "Select DATE_FORMAT(u.date_of_birth, '%Y-%m-%d') AS date_of_birth,u.full_name,u.email,u.contact_number,u.password,l.hire_date from Users u join LabStaff l on u.user_id=l.user_id where l.lab_staff_id=?";
        const [row] = await con.query(query, [pid]);
        res.json(row[0]);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/labstaffreports/:id", async (req, res) => {
    try {
        const pid = req.params.id;
        const query = "Select r.labreport_id,DATE_FORMAT(l.test_date, '%Y-%m-%d') as test_date,l.test_time,l.test_type,l.patient_id from LabTests l join LabReports r on l.labtest_id=r.labtest_id where r.result='N/A' and l.staff_id=?";
        const [row] = await con.query(query, [pid]);
        res.json(row);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.get("/doctors", async (req, res) => {
    try {
        const query = "SELECT U.full_name,D.specialization,D.doctor_id FROM Users U INNER JOIN Doctors D on D.user_id=U.user_id";
        const [rows] = await con.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const query = "SELECT * FROM Users WHERE email=? AND password=?";
        const [users] = await con.query(query, [username, password]);
        if (users.length === 0) {
            return res.status(400).send({ success: false, message: "Invalid id or password" });
        }
        const user = users[0];

        if (user.role === 'patient') {
            const query = "SELECT * FROM Patients WHERE user_id=?";
            const [patients] = await con.query(query, [user.user_id]);

            if (patients.length > 0) {
                user.patient_id = patients[0].patient_id;

            }
        }
        else if (user.role === 'labstaff') {
            const query = "SELECT * FROM LabStaff WHERE user_id=?";
            const [labstaff] = await con.query(query, [user.user_id]);

            if (labstaff.length > 0) {
                user.lab_staff_id = labstaff[0].lab_staff_id;

            }
        }
        else if (user.role ==='doctor') {
            const query = "SELECT * FROM Doctors WHERE user_id=?";
            const [dd] = await con.query(query, [user.user_id]);
            if (dd.length > 0) {
                user.doctor_id = dd[0].doctor_id;
            }
        }
        else if (user.role ==='admin') {
            const query = "SELECT * FROM Admin WHERE user_id=?";
            const [dd] = await con.query(query, [user.user_id]);
            if (dd.length > 0) {
                user.admin_id = dd[0].admin_id;
            }
        }

        res.send({ success: true, user });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "An error occurred" });
    }
});
   app.post('/api/signup', async (req, res) => {
    const { fullName, email, dob, contactNumber, password } = req.body;
  
    // Validate input (Basic validation for non-empty fields)
    if (!fullName || !email || !dob || !contactNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const [results] = await con.query('SELECT * FROM Users WHERE email = ?', [email]);
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      const [maxUserResult] = await con.query('SELECT MAX(user_id) AS maxUserId FROM Users');
      const maxUserId = maxUserResult[0].maxUserId || 0; // Default to 0 if no users exist
  
      const newUserId = maxUserId + 1;
  
      const query = 'INSERT INTO Users (user_id,full_name, email, date_of_birth, contact_number, password, role) VALUES (?, ?, ?, ?, ?, ?,?)';
      await con.query(query, [newUserId,fullName, email, dob, contactNumber, password, 'patient']);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
  

app.post("/resheduleApp", async (req, res) => {
    try {
        const { id, date, time } = req.body;
        const query = "UPDATE Appointments SET appointment_date = ?, appointment_time = ?, status = 'pending' WHERE appointment_id = ?";
        const [result] = await con.query(query, [date, time, id]);
        res.send({ success: true, result });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to reschedule appointment" });
    }
});

app.post("/reshedulelab", async (req, res) => {
    try {
        const { id, date, time } = req.body;
        const query = "UPDATE LabTests SET test_date = ?, test_time= ? WHERE labtest_id = ?";
        const [result] = await con.query(query, [date, time, id]);
        res.send({ success: true, result });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to reschedule appointment" });
    }
});

app.post("/confirmApp", async (req, res) => {
    try {
        const { pid, date, time, did } = req.body;
        const [rows] = await con.query("SELECT MAX(appointment_id) AS max_id FROM Appointments");

        let nextAppointmentId = "A1";
        if (rows[0].max_id) {
            const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
            nextAppointmentId = `A${maxNumericId + 1}`;
        }

        const query = `
            INSERT INTO Appointments 
            (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        const [result] = await con.query(query, [nextAppointmentId, pid, did, date, time]);

        res.send({ success: true, result });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to schedule appointment" });
    }
});


app.delete('/appointments/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const query = 'DELETE FROM Appointments WHERE appointment_id = ?';
        const [result] = await con.query(query, [appointmentId]);
        if (result.affectedRows > 0) {
            res.status(200).send({ success: true, message: 'Appointment deleted successfully' });
        } else {
            res.status(404).send({ success: false, message: 'Appointment not found' });
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
});

app.delete('/lab/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const query = 'DELETE FROM LabTests WHERE labtest_id = ?';
        const [result] = await con.query(query, [appointmentId]);
        if (result.affectedRows > 0) {
            res.status(200).send({ success: true, message: 'Lab test deleted successfully' });
        } else {
            res.status(404).send({ success: false, message: 'Lab test not found' });
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
});

app.post("/confirmtest", async (req, res) => {
    try {
        const { pid, date, time, test } = req.body;
        let [rows] = await con.query("SELECT MAX(labtest_id) AS max_id FROM LabTests");

        let nextAppointmentId = "L1";
        if (rows[0].max_id) {
            const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
            nextAppointmentId = `L${maxNumericId + 1}`;
        }
        const query = `
           INSERT INTO LabTests (labtest_id, test_date, test_time, test_type, patient_id, staff_id)
           VALUES (?, ?, ?, ?, ?, 'L101');
        `;
        const [result] = await con.query(query, [nextAppointmentId, date, time, test, pid]);

         [rows] = await con.query("SELECT MAX(labtest_id) AS max_id FROM LabReports");

        let nextAppointment = "LR1";
        if (rows[0].max_id) {
            const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
            nextAppointment = `LR${maxNumericId + 1}`;
        }
        const labReportQuery = `
           Insert into LabReports(labreport_id,labtest_id,result) values(?,?,?);
        `;
        const [labReportResult]  = await con.query(labReportQuery, [nextAppointment, nextAppointmentId,'N/A']);
        res.send({ success: true, result });


    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to schedule appointment" });
    }
});

app.post("/ambulance", async (req, res) => {
    try {
        const { pid, address } = req.body;
        const [rows] = await con.query("SELECT MAX(call_id) AS max_id FROM Calls");

        let nextAppointmentId = "C1";
        if (rows[0].max_id) {
            const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
            nextAppointmentId = `C${maxNumericId + 1}`;
        }

        const query = `
            INSERT INTO Calls (call_id, patient_id, date, time, address)
            VALUES (?, ?, CURDATE(), CURTIME(), ?);
        `;
        const [result] = await con.query(query, [nextAppointmentId, pid, address]);

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false });

        res.send({
            success: true,
            call_id: nextAppointmentId,
            date: formattedDate,
            time: formattedTime,
            address,
        });

    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to schedule appointment" });
    }
});

app.get("/labreports/:patientId", async (req, res) => {
    const { patientId } = req.params;

    try {

        const query =
            `Select R.labreport_id,DATE_FORMAT(L.test_date, '%Y-%m-%d') AS result_date,L.test_type from LabReports R
             inner join LabTests L on L.labtest_id=R.labtest_id where L.patient_id=? and R.result!='N/A'`;

        const [readyReports] = await con.query(query, [patientId]);

        const query2 =
            `Select R.LabReport_id,DATE_FORMAT(L.test_date, '%Y-%m-%d') AS result_date,L.test_type from LabReports R
         inner join LabTests L on L.labtest_id=R.labtest_id where L.patient_id=? and R.result='N/A'`;

        const [inProgressReports] = await con.query(query2, [patientId]);

        res.send({ success: true, readyReports, inProgressReports });
    } catch (error) {
        console.error("Error fetching lab reports:", error);
        res.status(500).send({ success: false, message: "Failed to fetch lab reports" });
    }
});


app.get("/labtests/:id", async (req, res) => {
    const { id } = req.params;
    const testType = req.query.testType;

    try {
        let query = "";
        if (testType === "Blood Test") {
            query = `
        SELECT resultId, gender,DATE_FORMAT(dob, '%Y-%m-%d') as dob, age, bloodType, hemoglobin, plateletsCount
        FROM BloodTestResults
        WHERE labreport_id = ?
      `;
        } else if (testType === "Diabetic Test") {
            query = `
        SELECT resultId, gender,DATE_FORMAT(dob, '%Y-%m-%d') as dob, age, bloodType, HbA1c, estimatedAvgGlucose
        FROM DiabeticTestResults
        WHERE labreport_id = ?
      `;
        } else if (testType === "Genetic Test") {
            query = `
        SELECT resultId, gender,DATE_FORMAT(dob, '%Y-%m-%d') as dob, age, bloodType, gene, DNADescription, ProteinDescription
        FROM GeneticTestResults
        WHERE labreport_id = ?
      `;
        } else {
            return res.status(400).json({ error: "Invalid test type" });
        }

        const [results] = await con.query(query, [id]);
        if (results.affectedRows == 0) {
            return res.status(404).json({ error: "Result not found" });
        }
        res.json(results[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get("/medicines", async (req, res) => {
    try {
        const query = "SELECT * FROM Medicines";
        const [rows] = await con.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database query failed");
    }
});

app.post("/orders", async (req, res) => {
    try {
        const { id, order_date, cost, address } = req.body;
        const query = 'INSERT INTO Orders (order_date, patient_id, cost) VALUES (?, ?, ?)';
        const [result] = await con.query(query, [order_date, id, cost]);
        res.send({ success: true, message: 'Order placed successfully' });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send({ success: false, message: "Failed to place the order" });
    }
});

// Add Blood Test Results
app.post('/addBloodTest', async (req, res) => {
    const [rows] = await con.query("SELECT MAX(resultId) AS max_id FROM BloodTestResults");

    let nextAppointmentId = "B1";
    if (rows[0].max_id) {
        const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
        nextAppointmentId = `B${maxNumericId + 1}`;
    }
    const { labReportId, gender, dob, age, bloodType, hemoglobin, plateletsCount } = req.body;

    const sql = `
      INSERT INTO BloodTestResults 
      (resultId, labreport_id, gender, dob, age, bloodType, hemoglobin, plateletsCount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await con.query(sql, [nextAppointmentId, labReportId, gender, dob, age, bloodType, hemoglobin, plateletsCount]);
    const q = "Update LabReports set result='Available' where labreport_id=?";
    await con.query(q, [labReportId]);

    res.send({ success: true, message: 'Record added!' });
});

// Add Diabetic Test Results
app.post('/addDiabeticTest', async (req, res) => {
    const { labReportId, gender, dob, age, bloodType, HbA1c, estimatedAvgGlucose } = req.body;
    const [rows] = await con.query("SELECT MAX(resultId) AS max_id FROM DiabeticTestResults");

    let nextAppointmentId = "D1";
    if (rows[0].max_id) {
        const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
        nextAppointmentId = `D${maxNumericId + 1}`;
    }
    const sql = `
      INSERT INTO DiabeticTestResults 
      (resultId,labreport_id, gender, dob, age, bloodType, HbA1c, estimatedAvgGlucose) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await con.query(sql, [nextAppointmentId, labReportId, gender, dob, age, bloodType, HbA1c, estimatedAvgGlucose]);
    const q = "Update LabReports set result='Available' where labreport_id=?";
    await con.query(q, [labReportId]);

    res.send({ success: true, message: 'Record added!' });

});

// Add Genetic Test Results
app.post('/addGeneticTest', async (req, res) => {
    const { labReportId, gender, dob, age, bloodType, gene, DNADescription, ProteinDescription } = req.body;
    const [rows] = await con.query("SELECT MAX(resultId) AS max_id FROM GeneticTestResults");

    let nextAppointmentId = "G1";
    if (rows[0].max_id) {
        const maxNumericId = parseInt(rows[0].max_id.substring(1), 10);
        nextAppointmentId = `G${maxNumericId + 1}`;
    }
    const sql = `
      INSERT INTO GeneticTestResults 
      (resultId,labreport_id, gender, dob, age, bloodType, gene, DNADescription, ProteinDescription) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const q = "Update LabReports set result='Available' where labreport_id=?";
    await con.query(q, [labReportId]);
    res.send({ success: true, message: 'Record added!' });
});

//changes
app.post('/doctor/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = `
            SELECT 
                D.doctor_id, 
                U.full_name, 
                D.specialization, 
                U.contact_number
            FROM 
                Doctors D
            INNER JOIN 
                Users U ON D.user_id = U.user_id
            WHERE 
                U.email = ? AND U.password = ?;
        `;
        const [rows] = await con.query(query, [email, password]);

        if (rows.length === 0) {
            return res.status(400).send('Invalid email or password');
        }

        // Send back doctor data (doctorId, full name, specialization, etc.)
        res.json({ doctor: rows[0] });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to login");
    }
});

app.get("/doctor/appointments/:id", async (req, res) => {
    try {
        const doctorId = req.params.id;
        const query = `
            SELECT 
                A.appointment_id,
                DATE_FORMAT(A.appointment_date, '%Y-%m-%d') AS appointment_date,
                A.appointment_time,
                P.full_name AS patient_name,
                A.room_id,
                A.status
            FROM 
                Appointments A
            INNER JOIN 
                Patients P ON A.patient_id = P.patient_id
            WHERE 
                A.doctor_id = ?
            ORDER BY 
                A.appointment_date DESC;
        `;
        const [rows] = await con.query(query, [doctorId]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch appointments");
    }
});

app.put("/doctor/appointments/:id", async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body; // Status can be 'Confirmed', 'Completed', 'Cancelled'
        const query = "UPDATE Appointments SET status = ? WHERE appointment_id = ?";
        const [result] = await con.query(query, [status, appointmentId]);
        res.send({ success: true, result });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to update appointment status");
    }
});

// 3. Get Doctor’s Profile
app.get("/doctor/profile/:id", async (req, res) => {
    try {
        const doctorId = req.params.id;
        const query = `
            SELECT 
                D.doctor_id, 
                U.full_name, 
                D.specialization, 
                D.phone_number
            FROM 
                Doctors D
            INNER JOIN 
                Users U ON D.user_id = U.user_id
            WHERE 
                D.doctor_id = ?;
        `;
        const [rows] = await con.query(query, [doctorId]);
        res.json(rows[0] || {});
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch doctor profile");
    }
});

app.get('/api/doctor-profile/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const [user] = await con.query('Select a.*,u.* from Users u join Doctors a on a.user_id=u.user_id where a.user_id=?', [id]);
      if (user.length === 0) {
        return res.status(404).send('User not found');
      }
      res.send(user[0]);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Failed to fetch user');
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
        const doctorId = req.params.id;
        const query = `
            Select u.full_name,DATE_FORMAT(u.date_of_birth, '%Y-%m-%d') AS date_of_birth,u.contact_number,a.status,a.appointment_time,p.patient_id,a.appointment_id from 
            Users u join Patients p on u.user_id=p.user_id
            join Appointments a on
            p.patient_id=a.patient_id where a.doctor_id=?;
        `;
        const [rows] = await con.query(query, [doctorId]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch patients");
    }
});

app.get('/api/appointments/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        const query = `Select * from Appointments where doctor_id=?`;
        const [rows] = await con.query(query, [doctorId]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch patients");
    }

});

app.get('/api/diagnosis/:id', async (req, res) => {
    try {
        const Id = req.params.id;
        const query = `Select * from Diagnosis where patient_id=?`;
        const [rows] = await con.query(query, [Id]);
        res.json(rows);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch patients");
    }

});

app.put('/api/appointments/:id/cancel', async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // SQL query to update the appointment status to 'Cancelled'
        const query = `UPDATE Appointments SET status = 'Cancelled' WHERE appointment_id = ?`;
        const [result] = await con.query(query, [appointmentId]);

        // Check if any rows were affected (i.e., an appointment was updated)
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Appointment status updated to Cancelled successfully' });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to update appointment status");
    }
});

app.put('/api/reshedule/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { date, time } = req.body;

        // Validate input
        if (!date || !time) {
            return res.status(400).json({ message: "Date and time are required" });
        }

        // SQL query to update the appointment date and time
        const query = `
            UPDATE Appointments 
            SET appointment_date = ?, appointment_time = ? 
            WHERE appointment_id = ?`;
        const [result] = await con.query(query, [date, time, appointmentId]);

        // Check if any rows were affected (i.e., an appointment was updated)
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Appointment rescheduled successfully" });
        } else {
            res.status(404).json({ message: "Appointment not found" });
        }
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to reschedule appointment");
    }
});

app.post("/api/prescriptions", async (req, res) => {
    try {
        const { patientId, medicine, dosage, duration, diagnosis } = req.body;
        
        const query = `
            INSERT INTO Prescriptions (patient_id, medicine, dosage, duration, diagnosis, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); 
        
        const [result] = await con.query(query, [patientId, medicine, dosage, duration, diagnosis, currentDate]);
        
        res.send({ success: true, message: "Prescription saved successfully", result });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to save prescription");
    }
});

app.get('/api/prescriptions/:patientId', async (req, res) => {
    const { patientId } = req.params;
    try {
        const [history] = await con.query(
            'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, diagnosis, CONCAT(medicine, " - ", dosage, " - ", duration) AS prescription FROM Prescriptions WHERE patient_id = ?',
            [patientId]
        );
        res.json(history);
    } catch (err) {
        console.error('Error fetching patient history:', err);
        res.status(500).send('Failed to fetch history');
    }
});

app.post("/api/update-profile", async (req, res) => {
    try {
        const { id, name, email, password } = req.body;

        if (!id|| !name || !email || !password) {
            return res.status(400).send({ success: false, message: "All fields are required." });
        }

        const query = `
            UPDATE Users 
            SET full_name = ?, email = ?, password = ?
            WHERE user_id = ?
        `;

        const [result] = await con.query(query, [name, email, password,id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        res.send({ success: true, message: "Profile updated successfully", result });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send({ success: false, message: "Failed to update profile." });
    }
});

app.get('/api/users', async (req, res) => {
    try {
      const [users] = await con.query("SELECT user_id, full_name, email FROM Users where role!='admin';");
      res.send(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Failed to fetch users');
    }
});

  
app.get('/api/medicines', async (req, res) => {
    try {
      const [users] = await con.query("SELECT medicine_id, name, stock, expiry_date, category, description, price FROM Medicines;");
      res.send(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Failed to fetch users');
    }
});
// Delete a user
app.delete('/api/users/:id', async (req, res)=>{
    try {
      const { id } = req.params;
      const [result] = await con.query('DELETE FROM Users WHERE user_id=?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
  
      res.send({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Failed to delete user');
    }
});
  
// Fetch user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [user] = await con.query('SELECT user_id, full_name, email FROM Users WHERE user_id= ?', [id]);
      if (user.length === 0) {
        return res.status(404).send('User not found');
      }
      res.send(user[0]);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Failed to fetch user');
    }
  });
  
  // Update user by ID
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { full_name, email } = req.body;
      const [result] = await con.query(
        'UPDATE Users SET full_name = ?, email = ? WHERE user_id = ?',
        [full_name, email, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
      res.send({ success: true, message: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Failed to update user');
    }
  });

  app.put('/api/medicines/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
  
    try {
      const [result] = await con.query(
        "UPDATE Medicines SET stock = ? WHERE medicine_id = ?",
        [stock, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).send('Medicine not found');
      }
  
      res.send({ message: 'Stock updated successfully' });
    } catch (err) {
      console.error('Error updating stock:', err);
      res.status(500).send('Failed to update stock');
    }
  });

  app.delete('/api/medicines/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await con.query(
        "DELETE FROM Medicines WHERE medicine_id = ?",
        [id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).send('Medicine not found');
      }
  
      res.send({ message: 'Medicine deleted successfully' });
    } catch (err) {
      console.error('Error deleting medicine:', err);
      res.status(500).send('Failed to delete medicine');
    }
  });
  
  app.post('/api/medicinesadd', async (req, res) => {
    const { name, category, description, stock, price, date } = req.body;
  
    try {
      const query = `
        INSERT INTO Medicines (name, category, description, stock, price, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await con.query(query, [name, category, description, stock, price, date]);
      res.status(201).send({ message: 'Medicine added successfully' });
    } catch (error) {
      console.error('Error adding medicine:', error);
      res.status(500).send({ error: 'Failed to add medicine' });
    }
  });

  app.get('/api/admin-profile/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [user] = await con.query('Select a.*,u.* from Users u join Admin a on a.user_id=u.user_id where a.user_id= ?', [id]);
      if (user.length === 0) {
        return res.status(404).send('User not found');
      }
      res.send(user[0]);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Failed to fetch user');
    }
  });


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
