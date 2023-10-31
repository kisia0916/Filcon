import * as net from "net"
import * as uuid from "uuid"
import { tcpDataType } from "../types/tcpDataType"
import { createSendData } from "../functions/createSendData"
const server = net.createServer()
const PORT = 3000

interface targetType{
    id:string,
    localIP:string,
    globalIP:string,
    sendSys?:any
}
interface clientType{
    id:string,
    conTarget:string
    sendSys?:any
}

let targetList:targetType[] =[]
let publickTargetList:targetType[] = []
let clientList:clientType[] = []

server.on("connection",(socket)=>{
    console.log("connected")
    let id:string = ""
    socket.on("data",(data:string)=>{
        const getData:tcpDataType = JSON.parse(data)
        if(getData.type === "first-target"){
            console.log(getData.data)
            if(!targetList.includes(getData.data[0])){
                const listData:targetType ={
                    id:uuid.v4(),
                    localIP:getData.data[0].localIP,
                    globalIP:getData.data[0].globalIP,
                    sendSys:socket
                }
                targetList.push({
                    id:listData.id,
                    localIP:listData.localIP,
                    globalIP:listData.globalIP,
                    sendSys:listData.sendSys
                })
                publickTargetList.push({
                    id:listData.id,
                    localIP:listData.localIP,
                    globalIP:listData.globalIP,
                })
                id = listData.id
                const sendData = JSON.stringify(createSendData("sendIP",[id]))
                socket.write(sendData)
                console.log(publickTargetList)
            }
        }else if(getData.type === "first-client"){
            const listData:clientType = {
                id:uuid.v4(),
                conTarget:"",
                sendSys:socket
            }
            id = listData.id
            clientList.push(listData)
            const sendData = JSON.stringify(createSendData("targetList",[publickTargetList]))
            socket.write(sendData)
        }else if(getData.type === "select-target"){
            console.log(getData.data[0])
            const clientIndex = clientList.findIndex(elem=>elem.id ===id)
            clientList[clientIndex].conTarget = getData.data[0]
            const targetIndex = publickTargetList.findIndex(elem=>elem.id === getData.data[0])
            const sendData = JSON.stringify(createSendData("connectedInfo",[publickTargetList[targetIndex]]))
            socket.write(sendData)
            console.log(clientList)

        }else if(getData.type === "sendCmdText"){
            console.log(getData.data[0])
            const clientIndex:number = clientList.findIndex(elem=>elem.id === id)
            const targetIP:string = clientList[clientIndex].conTarget
            const targetIndex:number = publickTargetList.findIndex(elem=>elem.id === targetIP)
            const sendData = JSON.stringify(createSendData("sendCmd",[getData.data[0]]))
            targetList[targetIndex].sendSys.write(sendData)
        }
    })
    socket.on("close",()=>{
        const deleteIndexTarget = publickTargetList.findIndex(elem=>elem.id === id)
        const deleteIndexClient = clientList.findIndex(elem=>elem.id === id)
        if(deleteIndexTarget != -1){
            targetList.splice(deleteIndexTarget,1)
            publickTargetList.splice(deleteIndexTarget,1)
        }
        if(deleteIndexClient != -1){
            clientList.splice(deleteIndexClient,1)
            console.log(clientList)
        }

    })
    socket.on("error",(error)=>{
    })
})

server.listen(PORT,()=>{
    console.log("server run")
})