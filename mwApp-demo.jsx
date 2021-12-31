const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoaded: false,
    isError: false,
    data: initialData
  });
  console.log(state);

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoaded: false,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoaded: true,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoaded: true,
        isError: true
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Container, Card, Button } = ReactBootstrap;
  const { Fragment, Link, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("apple");
  const [{ data, isLoaded, isError }, doFetch] = useDataApi(
    "https://dictionaryapi.com/api/v3/references/collegiate/json/apple?key=1b303e31-a96c-48c3-a9e7-2c6f6dbc13d9",
    []
  );
  const [i, setI] = useState(0);

  let incorrect = false;
  let justOne = false;
  let loaderMessage = false;
  let normal = false;
  let closestResults = false;
  let etymology = false;
  let subsequentOptions = false;
  let historical = '';
  let defs = [];
  let word = '';
  let wordType = '';
  let pronunciation = '';
  if(data.length > 1 && typeof data[i] !== 'string') {
    normal = true;
    subsequentOptions = true;
    defs = data[i].shortdef;
    word = data[i].meta.id.replace(/[:][0-9]/g,"");
    wordType = data[i].fl;
    if(typeof data[i].hwi.prs !== 'undefined'){
      pronunciation = `Pronounced: ${data[i].hwi.prs[0].mw.replace(/[ˈ]/g,"")}`;
    }
    else{
      pronunciation = '';
    }
    if(typeof data[i].et !== 'undefined'){
      etymology = true;
      historical = `Etymology: ${data[i].et[0][1].replace(/{it}|{\/it}/g, "\"")}`;
    }
  }
  if(data.length === 1 && data[i].fl === 'abbreviation'){
    justOne = true;
    word = data[i].meta.id.replace(/[:][0-9]/g,"");
    defs = data[i].shortdef;
  }
  if(typeof data[i] == 'object'){
    normal = true;
    subsequentOptions = true;
    defs = data[i].shortdef;
    word = data[i].meta.id.replace(/[:][0-9]/g,"");
    wordType = data[i].fl;
    if(typeof data[i].hwi.prs !== 'undefined'){
      pronunciation = `Pronounced: ${data[i].hwi.prs[0].mw.replace(/[ˈ]/g,"")}`;
    }
  }
  if(typeof data[i] == 'undefined') {
    incorrect = true;
  }
  if(typeof data[i] == 'string'){
    closestResults = true;
  }
  if(isLoaded === false){
    loaderMessage = true;
  }
  
  console.log("Rendering App");
  console.log(data[i]);
  console.log(data);
  console.log(defs);
  console.log(`
    Closest Rules: ${closestResults} 
    Incorrect: ${incorrect} 
    Just One: ${justOne} 
    Loaded: ${loaderMessage} 
    Normal: ${normal}
    Etymology: ${etymology}
  `);


  const iUpdate = (index) => {
    setI(index);
    console.log(`
    I equals: ${i}
    The index is: ${index}
    `)
  }
  return (
      <Container style={{ width: '500px', filter: 'drop-shadow(0 0 4rem rgb(236, 247, 249, 0.5))' }}>

        <Card style={{ marginBottom: '50px', border: '3px solid black', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
          <a href="./index.html"><Card.Img variant="top" src="MWLogo.png" style={{ position: 'relative', left: '50%', transform: 'translate(-50%)', width: '200px', height: 'auto'}} /></a>
          <form 
            onSubmit={event => {
              iUpdate(0);
              doFetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${query}?key=1b303e31-a96c-48c3-a9e7-2c6f6dbc13d9`);
              event.preventDefault();
              }}
            style={{ textAlign: 'center', borderRadius: '3px', padding: '10px', backgroundColor: 'white' }}>
            <label style={{ paddingRight: '5px' }}>Search:</label>
            <input type="text" value={query} onChange={event => setQuery(event.target.value)} style={{ marginRight: '5px', backgroundColor: '#f2f2f2', border: 'solid 1px black', borderRadius: '3px' }}/>
            <button id="search" type="submit">Search</button>
          </form>
          <Card.Body style={{ borderTop: '35px solid red', background: 'linear-gradient(to top, #f2f2f2 0%, #e6e6e6 100%)', boxShadow: '0 10px 7px 1px rgba(0, 0, 0, 0.2) inset' }}>
            <Card.Text>

              {incorrect && <div>Sorry, your search didn't match any results. Please check your spelling and try again.</div>}

              {isError && <div>Something Went Wrong...</div>}

              {loaderMessage && <div>Loading...</div>}

              {normal && 

                <div>
                  
                  <h3>{word} <span>{wordType}</span> </h3>
                  <h5>{pronunciation}</h5>
                  <ol>
                    {defs.map((element, index, array) => (
                      <li key={index}>
                        {element}
                      </li>
                    ))}
                  </ol>
                
                </div>

              }

              {closestResults && 
              
                <ol>
                  {data.map((element, index, array) => (
                    <li key={index}>
                      <button id="alts" style={{border: '0', backgroundColor: 'transparent'}} onClick={event => {
                      doFetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${element}?key=1b303e31-a96c-48c3-a9e7-2c6f6dbc13d9`);
                      event.preventDefault();
                    }}>{element}</button>
                    </li>
                  ))}
                </ol>
              
              }

              {justOne && 
              
                <div>

                  <p>
                    Abbreviation for: <button id="alts" style={{border: '0', backgroundColor: 'transparent'}} onClick={event => {
                      doFetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${defs}?key=1b303e31-a96c-48c3-a9e7-2c6f6dbc13d9`);
                      event.preventDefault();
                    }}>{defs}</button>
                  </p>

                </div>
              
              }

              {etymology && 
              
                <p id={'historical'}>{historical}</p>
              
              }

              {subsequentOptions &&
                <div>
                  {data.map((element, index, array) => (
                    <button key={index} id="subs" onClick={event => {
                      iUpdate(index);
                      doFetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${query}?key=1b303e31-a96c-48c3-a9e7-2c6f6dbc13d9`);
                      event.preventDefault();
                    }}>{index + 1}</button>
                  ))}
                </div>
              }

            </Card.Text>
          </Card.Body>
        </Card>

      </Container>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));