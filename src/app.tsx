import * as ReactDOM from "react-dom";
import firebase from "firebase/app";
import "firebase/database";
import { collection } from "firebase/firestore";
import { Home } from "./home";

function render() {
  ReactDOM.render(
    <>
      <h1>
        Connection status: <strong id="status"></strong>
      </h1>
      <Home></Home>
    </>,

    document.body
  );
}

render();
