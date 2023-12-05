import { useState } from 'react'
import { globals } from '../globals'

import AsyncSelect from 'react-select/async';
import  Select  from 'react-select'

import { useNavigate } from 'react-router-dom'

import '../styles/Search.css'
import '../styles/App.css'
import { DummyFetch } from '../functions/DummyFetch';

const selectStyles = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        borderColor: state.isFocused ? '#274c77' : '#d3dee5',
        borderRadius: '10px',
        borderWidth: '3px',
        marginLeft: '10%',
        width: '100%',
        border: state.menuIsOpen && '2px' && 'solid #2684FF',
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginLeft: '10%',
        width: '100%', 
    }),
}

export function Search() {
    //input boxes
    const [testType, setTestType] = useState("")
    const [subject, setSubject] = useState("")
    const [professor, setProfessor] = useState("")
    const [className, setClassName] = useState("")
    const [year, setYear] = useState("")
    const [solutions, setSolutions] = useState(false)
    const [quarter, setQuarter] = useState(""); 

    const navigate = useNavigate()

    DummyFetch()
    function sendToResults(e){
        e.preventDefault()
        // FORMAT FOR QUERIES:
        /* :[subject]:[class]:[professor]:[year]:[has solutions]:[test type]:[quarter] */

        const queries = [subject, className, professor, year, solutions, testType, quarter]
        for (let i = 0; i < queries.length; i++){
            queries[i] = queries[i]?.label ?? ''
        }

        let queryString = ':' + queries.join(':')
        console.log(queryString)
        navigate('/results/' + encodeURI(queryString))
    }
    // todo: add missing params
    return (
        <>
            <h1>Search</h1>
            <h3>What are you looking for today?</h3>
            <form class='search-form'>
                <div class='search-div'>
                    <label class='search-label' for='documentType'>I WANT TO FIND A</label>
                    <Select 
                        styles={selectStyles} placeholder="Select Test Type" 
                        name='documentType' options={formatOptionsArr(testTypeList)} onChange={(newValue) => setTestType(newValue)} />
                </div>
                <div class='search-div'>
                    <label class='search-label' for='subject'>FOR SUBJECT</label>
                    <AsyncSelect 
                        styles={selectStyles} placeholder="Select Subject" 
                        name='subject' loadOptions={() => getAndFormat(() => getUniqueList('subject'))} onChange={(newValue) => setSubject(newValue)} cacheOptions defaultOptions/>
                </div>
                <div class='search-div'>
                    <label class='search-label' for='class'>BY COURSE</label>
                    <AsyncSelect 
                        styles={selectStyles} placeholder="Select Course Name" 
                        name='class' loadOptions={() => getAndFormat(() => getUniqueList('class'))} onChange={(newValue) => setClassName(newValue)} cacheOptions defaultOptions/>
                </div>
                <div class='search-div'>
                    <label class='search-label' for='professor'>BY PROFESSOR</label>
                    <AsyncSelect 
                        styles={selectStyles} placeholder="Select Professor Name" 
                        name='professor' loadOptions={() => getAndFormat(() => getUniqueList('professor'))} onChange={(newValue) => setProfessor(newValue)} cacheOptions defaultOptions/>
                </div>
                <div class='search-div'>
                    <label class='search-label' for='year'>FROM YEAR</label>
                    <AsyncSelect 
                        styles={selectStyles} placeholder="Select Year" 
                        name='year' loadOptions={() => getAndFormat(() => getUniqueList('year'))} onChange={(newValue) => setYear(newValue)} cacheOptions defaultOptions/>
                </div>
                <div class='search-div'>
                    <label class='search-label' for='quarter'>FROM QUARTER</label>
                    <Select 
                        styles={selectStyles} placeholder="Select Quarter" 
                        name='quarter' options={formatOptionsArr(quartersList)} onChange={(newValue) => setTestType(newValue)} />
                </div>
                <div class='search-div'>
                    <label class='search-label' for='has-solutions'>WITH SOLUTIONS</label>
                    <input class='search-input' name='has-solutions' type='checkbox' onChange={(event)=> {setSolutions(event.target.checked)}} />
                </div>
                <button class='search-button center-block' type="submit" label="search" onClick={(e) => sendToResults(e)} >SEARCH</button>
            </form>
        </>
        )
}



//testing functions to eventually be replaced with data we pull from server
async function getAndFormat(getter /*, formatter */){
    try{
        let options = await getter()
        console.log(options)
        return formatOptionsArr(options) // if we want to reuse this function, we have to pass the formatting function as an arg instead of this
    }
    catch (err){
        console.log(err)
    }
}


function formatOptionsArr(options){
    let formatted = []
    for (const i of options) {
        if (typeof(i) == String)
            formatted.push({ label: i, value: i.toLowerCase() })
        else
            formatted.push({ label: i, value: i })
    }
    console.log(formatted)
    return formatted
}

/* takes a string, e.g. class, professor, year, and returns the unique entries across all tests corresponding to that filter */
async function getUniqueList(filter){
    console.log(`trying to get ${filter} list`)
    let res
    try{
        res = await fetch(`${globals.server_url}/pdfs/unique/${filter}`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                filter: {},
            })
        })
        let data = await res.json()
        console.log(data)
        return data
    } catch (err){
        console.log(err)
        return [`Error fetching ${filter}(s)`]
    }
}

const testTypeList = ["Quiz", "Midterm", "Final", "Practice Quiz", "Practice Midterm", "Practice Final"]
const quartersList = ["Fall", "Winter", "Spring", "Summer"]

// const solutionsList = ['Solutions']
// solutions should be a checkbox


/* THIS FUNCTION MAY BE NEEDED IF WE WANT TO USE CHECKS INSTEAD OF DROP DOWNS
function CheckBox({ state, setState, label }) {
    return (
        <>
            <label>
                <input
                    type='checkbox'
                    checked={state}
                    onChange={(e) => setState(e.target.checked)}
                ></input>
                {label}
            </label>
        </>
    )
}
*/