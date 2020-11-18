import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import {Button, Table} from "antd";
import Axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import RequestService from "../../service/RequestService";
import {toast} from "react-toastify";
import "../../style/PostRequest.css";
import TextField from "@material-ui/core/TextField";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {ongoingColumns, modalStyle, pastColumns} from "../../style/PostRequestTable";
import Select from 'react-select'
import moment from 'moment';

const PostRequest = () => {
    const {user} = useSelector((state)=>({...state}))
    const profile = useSelector(state=>state.userProfile)
    const requestDetail = useSelector((state)=>state.requestDetail)
    const [tags, setTags] = useState([])
    const [ModalIsOpen, setModalIsOpen] = useState(false);



    const options = [
        { value: 'Easy to do', label: 'Easy to do' },
        { value: 'Shopping', label: 'Shopping' },
        { value: 'Cleaning', label: 'Cleaning' },
        { value: 'Tool needed', label: 'Tool needed' },
        { value: 'Grocery', label: 'Grocery' },
    ]



    const openPostWindow = () => {
        setModalIsOpen(true)
    }

    const [text, setText] = useState("");
    const [checked, setChecked] = useState(false)
    const [title, setTitle] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [past, setPast] = useState(false)


    const handleCheckBox = () => {
        setChecked(!checked)
    }

    const handleSubmit = async (e) => {
        // e.preventDefault();
        if (user == null){
            return;
        }
        let date = new Date()
        let requestBean ={
            requestContent:text,
            title: title,
            address: address,
            phoneNumber: phoneNumber,
            neededPhysicalContact: checked,
            createTime: date,
            tags: tags
        }

        if (text!=="" && title!=="" && address!=="" && phoneNumber!=="" && tags.length > 0){
            // console.log(text, title, address, phoneNumber)
            await RequestService.request(user.uid, requestBean).then(res=>{
                toast.success("save request to backend success")
            }).catch(res=>{
                toast.error("save failed")
            })
             window.location.reload();
        }else {
            console.log(text, title, address, phoneNumber)
            toast.error("please fill all required information")
        }

    }



    const handleChange = (e) => {
        if (e.target.value === "past"){
            setPast(true)
        }else {
            setPast(false)
        }

    }

    const addTags = (e) => {
        if (e != null){
            const result = e.map(res=>(res.value))
            setTags(result)
            console.log(result)
        }
    }

    const addAddress = (e) => {
        setAddress(e.value)
    }

    if(!profile || !requestDetail || !requestDetail.ongoingRequest || !requestDetail.pastRequest){
        return null
    }

    let {fullName, addressList} = profile
    let {ongoingRequest} = requestDetail
    const onGoingData = ongoingRequest.map((res,index)=>({
        key: index,
        status: res.status===1?"Volunteer on the way":"request sent",
        tags: res.tags===null?[]:res.tags,
        requestTitle: res.title,
        volunteer: res.volunteer === null? "Pending" : res.volunteer,
        requestTime: moment(res.createTime).format('HH:mm MM/DD/YYYY')
    }));


    const pastData = requestDetail.pastRequest.map((res,index)=>({
        key: index,
        tags: res.tags===null?[]:res.tags,
        requestTitle: res.title,
        volunteer: res.volunteer === null? "Pending" : res.volunteer,
        requestTime: moment(res.createTime).format('HH:mm MM/DD/YYYY')
    }));

    // react select of address list
    const addressOptions = addressList.length !== 0? addressList.map(address=>({
         value: address, label:address
      })) : [{value:"default", label:"no address recorded in database"}]


    return (
        <div style={customStyle}>

            <h1 className="float-left">Welcome{user==null?"":", "+fullName}</h1>
            <div className="grid">
                <div className="row">
                    <div className="col-sm-1">
                        <select className="ml-3" style={{border:'none', color:'darkgreen', outline:'none'}} defaultValue="onGoing" onChange={handleChange}>
                            <option value="onGoing">Ongoing Requests</option>
                            <option value="past">Past Requests</option>
                        </select>
                    </div>
                </div>
            </div>

            {past === true? <Table columns={pastColumns} dataSource={pastData} pagination={{defaultPageSize: 2}} /> :
                <Table columns={ongoingColumns} dataSource={onGoingData} pagination={{defaultPageSize: 2}} />
            }

            <Button type="primary" style={{background:'green', marginTop:'10px'}} shape="round" onClick={openPostWindow}>Post New Request</Button>


            <MuiThemeProvider>
                <Modal style={modalStyle} isOpen={ModalIsOpen} appElement={document.getElementById('root')}>
                    <h1 className="text-center">Post Request</h1>
                    <form >
                        <div>
                            <label className="form-inline" style={{height:'50px'}}>Title
                            <TextField style={{marginBottom:'30px', marginLeft:'20px'}} required id="standard-basic" label="Enter a title"
                              onChange={e=>setTitle(e.target.value)}/>
                            </label>
                            <div >
                                <div className="tags-input">
                                    <Select isMulti={true} options={options} onChange={addTags} placeholder={<div>Select tags</div>}/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="validationTextarea"/>
                            <textarea className="form-control"
                                      placeholder="Required request detail" required onChange={e=>setText(e.target.value)}>
                    </textarea>

                        </div>
                        <div className="form-inline">
                            <label >Phone Number</label>
                            <input style={{width:'50%'}} required type="phoneNumber" className="form-control ml-3 mt-3"
                                   onChange={e=>setPhoneNumber(e.target.value)}/>
                        </div>
                        <div className="form-group mt-3">
                            <Select options={addressOptions} placeholder={<div>Select your address</div>} onChange={addAddress}/>
                        </div>
                        <div className="form-group form-check">
                            <input type="checkbox" className="form-check-input" checked={checked} onChange={handleCheckBox}/>
                            <label className="form-check-label" >Physical contact needed</label>
                        </div>
                        <Button type="primary" style={{background:'green'}} shape="round" className="float-right" onClick={handleSubmit}>Post</Button>
                        <label style={{color:'green', cursor:'pointer'}} className="float-right m-2" onClick={()=>setModalIsOpen(false)}>Cancel</label>
                    </form>
                </Modal>
            </MuiThemeProvider>

        </div>
    );
}

const customStyle = {
    // top: '15%',
    // left: '50%',
    // right: 'auto',
    // bottom: 'auto',
    // width: '80%',
    marginLeft: '5%',
    marginRight: '5%',
    marginTop: '5%'
    // transform: 'translate(10%, 10%)',
}



export default PostRequest;