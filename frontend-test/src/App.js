import logo from './logo.svg';
import './App.css';
import axios from 'axios'


function App() {

  const click = async () => {
    try {
      const response = await axios.post('http://localhost:5000/request');
      console.log(response.data.url)
      window.location.href = response.data.url
    } catch (error) {
      console.error('Error making API request:', error);
    }
  };
  // const button = async() => {
  //   console.log('Button clicked')
  //   const response = await fetch('http://localhost:5000/request', {method: 'post'})
  //   console.log(response)
  //   const data = response.json()
  //   console.log(data)
  //   console.log(data.url)
  //   window.location.href = data.url
  // }
  return (
    <div className="App">
      <button onClick={click}>
        Google Sign in
      </button>
    </div>
  );
}

export default App;
