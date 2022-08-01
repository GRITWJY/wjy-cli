import React, { Component } from "react";
import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { Button } from "antd";
// import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "antd/dist/antd.less";

class App extends Component {
  render() {
    return (
      <div>
        <h1>App</h1>
        <Button type="primary">按钮</Button>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    );
  }
}

export default App;
