import fetch from "node-fetch";

const url = 'https://university-college-list-and-rankings.p.rapidapi.com/api/universities?countryCode=gh';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'f4c92201aamsh5c0e3ccf5b7f4bap136ee0jsn3ef690c91096',
    'X-RapidAPI-Host': 'university-college-list-and-rankings.p.rapidapi.com'
  }
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}