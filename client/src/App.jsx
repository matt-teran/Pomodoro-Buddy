import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import Timer from "./Timer";
import "./App.css";
import axios from "axios";
import initializeSpotify from "./initializeSpotify";
import LoginWithSpotify from "./LoginWithSpotify";

function App() {
  const [time, setTime] = useState();
  const [isStudying, setIsStudying] = useState(false);
  const [timerId, setTimerId] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionTime, setSessionTime] = useState(1500000);
  const [remainingSessionTime, setRemainingSessionTime] = useState(sessionTime);
  const [breakTime, setBreakTime] = useState(300000);
  const [remainingBreakTime, setRemainingBreakTime] = useState(breakTime);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [spotifyPlayer, setSpotifyPlayer] = useState();
  // const [accessToken, setAccessToken] = useState();

  // useEffect(() => {
  //   if (typeof window.Spotify !== "undefined")
  //     setSpotifyPlayer(initializeSpotify(accessToken));
  // }, [typeof window.Spotify === "undefined"]);

  useEffect(() => {
    if (isBreakTime) {
      if (remainingBreakTime >= 0) {
        setTimeout(() => {
          setRemainingBreakTime((prev) => prev - 1000);
        }, 1000);
      } else {
        spotifyPlayer.resume();
        alert("Time to study!!");
        setIsBreakTime(false);
        toggleSession();
      }
    } else {
      setRemainingBreakTime(breakTime);
    }
  }, [isBreakTime, remainingBreakTime]);

  useEffect(() => {
    if (sessionTime <= 0 && isStudying) {
      spotifyPlayer.pause();
      clearTimeout(timerId);
      setRemainingSessionTime(sessionTime);
      alert("break time!!!");
      setIsStudying(false);
      setIsBreakTime(true);
    }
  }, [timerId]);

  useEffect(() => {
    if (loggedIn) {
      axios
        .post("/api/updateTime", { time })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [time]);

  useEffect(() => {
    axios
      .get("/api/user")
      .then((res) => {
        if (res.data.username) {
          setTime(res.data.studyTime);
          setLoggedIn(true);
          // setAccessToken(res.data.accessToken);
          setTimeout(() => {
            setSpotifyPlayer(initializeSpotify(res.data.accessToken));
          }, 2000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const toggleSession = () => {
    if (isStudying) {
      clearTimeout(timerId);
    } else {
      spotifyPlayer.playURI();
      incrementStopwatch();
    }
    setIsStudying((prevIsStudying) => !prevIsStudying);
  };

  const incrementStopwatch = () => {
    setTimerId(
      window.setTimeout(() => {
        setRemainingSessionTime((prev) => {
          return prev - 1000;
        });
        setTime((prev) => {
          return prev + 1000;
        });
        incrementStopwatch();
      }, 1000)
    );
  };

  const loginHandler = (form) => {
    axios
      .post("/api/login", form)
      .then(({ data }) => {
        console.log(data);
        setTime(data.studyTime);
        setLoggedIn(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const registerHandler = (form) => {
    axios
      .post("/api/signup", form)
      .then((response) => {
        console.log(response);
        if (response.data.success) {
          setTime(0);
          setLoggedIn(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const logoutHandler = () => {
    axios
      .post("/api/logout")
      .then((res) => {
        console.log(res);
        setLoggedIn(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateMinutesHandler = (value, id) => {
    if (id === "session-time") {
      let timeInMs;
      if (value >= 180) {
        timeInMs = 180 * 60 * 1000;
      } else if (value <= 10) {
        timeInMs = 10 * 60 * 1000;
      } else {
        timeInMs = value * 60 * 1000;
      }
      setSessionTime(timeInMs);
      setRemainingSessionTime(timeInMs);
    } else {
      let timeInMs;
      if (value >= 60) {
        timeInMs = 60 * 60 * 1000;
      } else if (value <= 1) {
        timeInMs = 1 * 60 * 1000;
      } else {
        timeInMs = value * 60 * 1000;
      }
      setBreakTime(timeInMs);
      setRemainingBreakTime(timeInMs);
    }
  };

  const { Header, Content, Footer } = Layout;

  if (loggedIn)
    return (
      <Timer
        time={time}
        sessionTime={sessionTime}
        remainingSessionTime={remainingSessionTime}
        breakTime={breakTime}
        remainingBreakTime={remainingBreakTime}
        update={updateMinutesHandler}
        isStudying={isStudying}
        toggleSession={toggleSession}
        logoutHandler={logoutHandler}
        spotifyPlayer={spotifyPlayer}
      />
    );
  return (
    <div className="App">
      <Layout className="no-auth-layout">
        <Header></Header>
        <Content className="no-auth-content">
          <LoginWithSpotify />
        </Content>
        <Footer>Hire me</Footer>
      </Layout>
    </div>
  );
}

export default App;