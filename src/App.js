import React from "react";
import Layout from "./components/Layout";
import IndexComponent from "./components/pages/Index";

function App(props) {
  return (
    <Layout title="COVID-19 Analizer">
      <IndexComponent {...props} />
    </Layout>
  );
}

export default App;
