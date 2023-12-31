import React from "react";
import {useEffect} from "react"
import {useState} from "react"
import axios from "axios";
import {useParams} from "react-router-dom";
import {Link} from "react-router-dom"
import Navbar from "./Navbar";
import "../Styles/board.css"
/*
Should display all user jobs which includes the details of each job
*/
function Board(){
    /*************************DONT TOUCH THIS**************************** */
    const params = useParams()
    const [doc, setDoc] = useState({
        _id: "",
        username: "",
        password: "",
        jobs: [{
            company: "",
            title: "",
            status: "",
            description: "",
            resume: ""
        }]
    })

    const [rerender, setRerender] = useState("Loading")
    const [isDocLoaded, setIsDocLoaded] = useState(false)
    const [finalLoad, setFinalLoad] = useState(false)

    useEffect(() =>{ //get user document and load jobs to state
        if(isDocLoaded === false) fetchData()
        else if (rerender === "Loading") {
            loadResumeURLs()
        }
    }, [isDocLoaded, rerender])
    
    

    async function fetchData(){
        const id = params.id
        await axios.get(`http://localhost:5000/users/${id}`) //returns a single object in this case. Not wrapped in array
        .then(res => {
            setDoc(res.data)
            setIsDocLoaded(true) 
        })
        .catch(e => console.log("error is"+e))
    }

    async function loadResumeURLs(){
        const id = params.id
        doc.jobs.map((document, index) => {
            console.log("The current document resume is "+document.resume)
            axios.get(`http://localhost:5000/users/getPresignedResumeDownload/${id}/${document.resume}`)
            .then((url) => {
                const downloadURL = url.data.uploadUrl
                doc.jobs[index].resume = downloadURL
                if(index === doc.jobs.length - 1) setFinalLoad(true)
            })
            .catch(error => console.log("load resume url error is "+error))
        })
        setRerender("Loaded") 
    }
    /**********************************************/

    function jobsToDo(){//will return table of jobs
        return doc.jobs.map((document, index) => {
            if(document.status === "To Do")
                return <Document company={document.company} title={document.title} description={document.description} resume={document.resume} idx={index}></Document>
        })
    }

    function jobsWaiting(){
        return doc.jobs.map((document, index) => {
            if(document.status === "Waiting")
                return <Document company={document.company} title={document.title} description={document.description} resume={document.resume} idx={index}></Document>
        })
    }

    function jobsInterview(){
        return doc.jobs.map((document, index) => {
            if(document.status === "Interview")
                return <Document company={document.company} title={document.title} description={document.description} resume={document.resume} idx={index}></Document>
        })
    }

    function jobsResult(){
        return doc.jobs.map((document, index) => {
            if(document.status === "Result"){
                return <Document company={document.company} title={document.title} description={document.description} resume={document.resume} idx={index}></Document>
            }
        })
    }

    function Document(props:any){
        return(
            <div className="item">
                <h2>{props.company}</h2>
                <div>Title: {props.title}</div>
                <p>{props.description}</p>
                <a className="download-link" href={props.resume}>View Resume </a>
                <div className="edit-button"><Link className="to-edit" to={`/edit/${params.id}/${props.idx}`}>{"Edit"}</Link></div>
            </div>
            
        )
    }

    return (
        <div className="bg">
            {/*IF ? THEN () : ELSE ()*/}
            {rerender === "Loading" ? (<h1>loading</h1>): (
            <div className="bg2">
                <Navbar link={<Link className="to-create" to={`/create/${params.id}`}>{"Create"}</Link>}></Navbar>
                <section className="board-header">
                    <div>To do</div>
                    <div>Waiting</div>
                    <div>Interview</div>
                    <div>Result</div>
                </section>
                {finalLoad === false ? (<h1></h1>) : (
                <section className="board-primary">
                    <div className="ticket-columns">{jobsToDo()}</div>
                    <div className="ticket-columns">{jobsWaiting()}</div>
                    <div className="ticket-columns">{jobsInterview()}</div>
                    <div className="ticket-columns">{jobsResult()}</div>
                </section>
                )}
            </div>
            )}
        </div>
    )
}

export default Board;