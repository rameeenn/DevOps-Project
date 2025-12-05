import React from 'react';
import Footer from './Footer';
import Header from './Header';
const HomePage = () => {
  const navigate = (path) => {
    window.location.href = path;
  };
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif" }}>
      <Header />
      <section style={styles.imageSection}>
        <div style={styles.textOverlay}>
          <h1 style={styles.largetextblue}>Among the</h1>
          <h1 style={styles.largeText}>nations</h1>
          <h1 style={styles.largeText}>best</h1>
          <button
            style={styles.button}
            onClick={() => navigate('/appointment')}
          >
            Schedule your appointment now
          </button>
        </div>
        <img
          src="/hospital.png"
          alt="Healthcare Hero"
          style={styles.fullImage}
        />
      </section>
      <section style={styles.whiteSection}>
        <div style={styles.flexContainer}>
          <div style={styles.textContainer}>
            <h1 style={styles.largetextblue}>Accurate results</h1>
            <h1 style={styles.largetextblue}>in less time</h1>
            <p style={styles.bluetext}>
              Discover our wide range of lab tests and
            </p>
            <p style={styles.bluetext}>
              book one with guaranteed accuracy of
            </p>
            <p style={styles.bluetext}>results</p>
          </div>
          <div style={styles.subSections}>
            <div style={styles.subSection}>
              <img src="/labtest.png" alt="Icon 1" style={styles.icon} />
              <button
                style={styles.button}
                onClick={() => navigate('/lab-test')}
              >
                Book a Lab Test
              </button>
            </div>
            <div style={styles.subSection}>
              <img src="/reportlogo.png" alt="Icon 2" style={styles.icon} />
              <button
                style={styles.button}
                onClick={() => navigate('/reports')}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </section>
      <section style={styles.blueSection}>
        <div style={styles.ambulanceContainer}>
          <div style={styles.textContainer}>
            <h1 style={styles.largetextblue}>Our ambulance</h1>
            <h1 style={styles.largetextblue}>services are</h1>
            <h1 style={styles.largetextblue}>available 24/7</h1>
            <div style={styles.leftAlignedButtonContainer}>
              <button
                style={styles.button}
                onClick={() => navigate('/ambulance')}
              >
                Call an ambulance now
              </button>
            </div>
          </div>
          <div style={styles.ambulanceImageContainer}>
            <img
              src="/ambulance.jpg"
              alt="Ambulance"
              style={styles.ambulance}
            />
          </div>
        </div>
      </section>
      <section style={styles.whiteSection}>
        <div style={styles.medicineContainer}>
          <div style={styles.medicineImage}>
            <img
              src="/medicines.jpg"
              alt="Medicines"
              style={styles.medicine}
            />
          </div>
          <div style={styles.textContainer}>
            <h1 style={styles.s4largetextblue}>Order</h1>
            <h1 style={styles.s4largetextblue}>medicines in</h1>
            <h1 style={styles.s4largetextblue}>just one click</h1>
            <div style={styles.rightAlignedButtonContainer}>
              <button
                style={styles.button}
                onClick={() => navigate('/ordermedicine')}
              >
                Order medicines now
              </button>
            </div>
          </div>
        </div>
      </section>
      <section style={styles.imageSection}>
        <div style={styles.textOverlay}>
          <h1 style={styles.largeText}>Read Articles</h1>
          <h1 style={styles.largeText}>written by</h1>
          <h1 style={styles.largeText}>medical experts</h1>
          <button
            style={styles.button}
            onClick={() => navigate('/articles')}
          >
            Read articles now
          </button>
        </div>
        <img src="/book.jpg" alt="Articles" style={styles.fullImage} />
      </section>
      <Footer />
    </div>
  );
};
const styles = {
    imageSection: {
      width: "100%",
      height: "500px",
      position: "relative",
      overflow: "hidden",
    },
    fullImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: 1,
    },
    textOverlay: {
      position: "absolute",
      top: "50%",
      left: "0",
      paddingLeft: "20px",
      transform: "translateY(-50%)",
      color: "white",
      zIndex: 2,
      textAlign: "left",
    },
    largeText: {
      fontSize: "4em",
      fontWeight: "700",
      margin: 10,
    },
    largetextblue: {
      fontSize: "4em",
      fontWeight: "700",
      margin: "10px 0",
      marginBottom: "20px",
      color: "#0D095A",
      textAlign: "left",
      paddingLeft: "20px",
    },
    s4largetextblue: {
      fontSize: "4em",
      fontWeight: "700",
      margin: "10px 0",
      marginBottom: "20px",
      color: "#0D095A",
      textAlign: "right",
      paddingLeft: "20px",
    },
    button: {
      marginTop: "20px",
      backgroundColor: "#DA8026",
      color: "white",
      fontSize: "1.5em",
      fontWeight: "600",
      padding: "10px 30px",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    whiteSection: {
      backgroundColor: "white",
      padding: "50px 20px",
      textAlign: "center",
    },
    blueSection: {
      backgroundColor: "#9CC4F2",
      padding: "15px 10px",
      textAlign: "center",
      color: "white",
    },
    heading: {
      fontSize: "2em",
      marginBottom: "20px",
      fontWeight: "600",
    },
    text: {
      fontSize: "1.2em",
      lineHeight: "1.6",
    },
    bluetext: {
      fontSize: "1.7em",
      lineHeight: "1.2",
      color: "#0D095A",
      textAlign: "left",
      paddingLeft: "20px",
      margin: "5px 0",
    },
    flexContainer: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "20px",
    },
    textContainer: {
      flex: "2",
    },
    subSections: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "200px",
      paddingRight: "200px",
      marginLeft: "auto",
    },
    subSection: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "20px",
    },
    icon: {
      width: "100px",
      height: "100px",
      marginTop: "40px",
      marginBottom: "30px",
    },
    ambulanceContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
    },
    ambulanceImageContainer: {
      width: "50%",
    },
    ambulance: {
      width: "100%",
      height: "auto",
    },
    leftAlignedButtonContainer: {
      textAlign: "left",
    },
    rightAlignedButtonContainer: {
      textAlign: "right",
    },
    medicineContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
    },
    medicineImage: {
      width: "50%",
    },
    medicine: {
      width: "100%",
      height: "auto",
    },
  };
export default HomePage;
