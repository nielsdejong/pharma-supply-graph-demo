import { useState } from 'react';
import {
  Dropdown,
  Flex,
  Tabs,
  Typography,
  Widget,
} from '@neo4j-ndl/react';

import NoGraphImg from '../shared/assets/NoData.png';
import Header from '../shared/components/Header';
import MyTable from './Table';

import './style.css';
import MyGraph from './MyGraph';


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchInitiated, setIsSearchInitiated] = useState(false);

  const [activeTab, setActiveTab] = useState<number>(0);

  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);

  if (products.length == 0) fetchProducts().then(p => setProducts(p));// https://fastapi-example-6ljq.onrender.com/products/

  const handleSearch = (name) => {
    // e.preventDefault();
    setData([]);
    fetchProduct(name).then(d => setData(d));
    setIsSearchInitiated(true);
  };


  async function fetchProduct(name: string) {
    try {
      // API call to fetch data
      const url = 'http://fastapi-example-6ljq.onrender.com/products/' + name;
      // const url = 'http://localhost:8000/products/' + name
      const response = await fetch(url, {});

      // Checking if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parsing the response to JSON
      const data = await response.json();

      // Mapping the data to a new array with { label, value }
      const formattedData = data.map(item => ({
        product: item.product,
        quantity: item.quantity,
        customer: item.customer
      }));
      return formattedData;
    } catch (error) {
      console.error('Failed to fetch product ' + name, error);
    }
  }


  async function fetchProducts() {
    try {
      // API call to fetch data
      const url = 'http://fastapi-example-6ljq.onrender.com/products/';
      // const url = 'http://localhost:8000/products';
      const response = await fetch(url, {});

      // Checking if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parsing the response to JSON
      const data = await response.json();

      // Mapping the data to a new array with { label, value }
      const formattedData = data.map(item => ({
        label: item.name,
        value: item.name
      }));
      return formattedData;
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }


  const displayResult = () => {
    if (isSearchInitiated) {
      const searchResultElement = document.getElementById('search-result');
      if (searchResultElement) {
        searchResultElement.classList.add('search-result-visible');
      }
    }
  };

  return (
    <>
      <Header title='Product Search' navItems={[]} useNeo4jConnect={false} userHeader={false} />

      <div className='landing-page n-bg-palette-neutral-bg-default'>
        <form className={`search-bar ${isSearchInitiated ? 'top' : 'center'}`}>
          <div
            onTransitionEnd={displayResult}
            className={`text-input-container ${isSearchInitiated ? 'search-initiated' : ''}`}
          >
            <Dropdown
              label="Search"

              selectProps={{
                id: products.length,
                value: {
                  label: searchQuery,
                  value: searchQuery
                },
                onChange: (value) => { setSearchQuery(value.label); handleSearch(value.label); },
                options: products,
                placeholder: 'Start typing...'
              }}
              type="select"
            />


          </div>
        </form>
        <Widget
          className='n-bg-palette-neutral-bg-weak min-h-[60%] min-w-[60%] flex flex-col search-result'
          header=''
          isElevated={true}
          id='search-result'
        >
          <Flex flexDirection='column' justifyContent='space-between'>
            <div>
              <Tabs size='large' fill='underline' onChange={(e) => setActiveTab(e)} value={activeTab}>
                <Tabs.Tab tabId={0}>Table</Tabs.Tab>
                <Tabs.Tab tabId={1}>Graph</Tabs.Tab>
              </Tabs>
              <Flex className='p-6'>
                {activeTab === 0 ? (
                  < MyTable name={searchQuery} data={data} />
                ) : (
                  <MyGraph name={searchQuery} data={data} />
                )}
              </Flex>
            </div>
            <div className='text-center'>
              <>Results for "{searchQuery}"</>
            </div>
          </Flex>
        </Widget>
      </div>
    </>
  );
}
