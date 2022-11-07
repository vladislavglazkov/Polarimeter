navigator.serial.addEventListener('connect',ndev)
        let globalPort=null;

        window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'It looks like you have been editing something. '
                            + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

        async function gp(){
            
            console.log(ports);
            await new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()},1000);
            })
            var str=ports.writable.getWriter();
            console.log(str);
            const encoder = new TextEncoder();
            
            //let data=new Uint8Array(encoder.en);

            await str.ready;
            await str.write(encoder.encode('\r\n11').buffer);
            //console.log(data.buffer);
            while (ports.readable) {
  const reader = ports.readable.getReader();
  try {
    console.log("GO AHEAD");
    while (true) {
      const { value, done } = await reader.read();
      console.log((new TextDecoder).decode(value.buffer));
      if (done) {
        // |reader| has been canceled.
        break;
      }
      // Do something with |value|…
    }
  } catch (error) {
    // Handle |error|…
  } finally {
    reader.releaseLock();
  }
}
        }
        function ndev(e){
            console.log(e);
        }
        class App extends React.Component{
            constructor(props){
                super(props);
                this.state={connected:false};
            }
            async conn(){
                
                if (this.state.connected==false){
                var ports=await navigator.serial.requestPort({});
                console.log(ports);
                await ports.open({
                baudRate:9600
            });
            globalPort=ports;
            if (ports!=null){

                this.setState({connected:true});
                let wrt=globalPort.writable.getWriter();
                wrt.write((new TextEncoder()).encode("\r\n"));
                wrt.releaseLock();
                readglob();
                ports.addEventListener("disconnect",()=>{this.setState({connected:false})});    

            }
            

            }
            else{
                globalReader.releaseLock();
                await globalPort.close();
                this.setState({connected:false});
                globalPort=null;
            }
            }
            render(){
                return (
                    <div>
                    <Connectivity status={this.state.connected} onClick={this.conn.bind(this)}></Connectivity>
                    {this.state.connected==false?null:<div>
                    <ConnectButton name="Connect"> </ConnectButton>
                    <br/>
                    <Experiment></Experiment></div>
                    }
                    </div>
                );
            }
        }

        async function delay(ms){
            let pr=new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()},ms);
            })
            await pr;
        }
        let buffer=new Uint8Array(0);
        let bufferStr="";
        let subscr=null;
        let readState=0;
        let globalReader=0;
        async function readglob(){
            let reader=globalPort.readable.getReader();
            globalReader=reader;
            let lcl=null;
            while (true){
                
                let {value,done}=await reader.read();
                console.log("got chunk");
                console.log(value);
                if (lcl!=null){
                    clearTimeout(lcl);
                }
                if (readState==0){
                    if (subscr!=null){
                        buffer=new Uint8Array();
                        readState=1;
                    }
                }
                let ans=new Uint8Array(buffer.length+value.length);
                ans.set(buffer,0);
                ans.set(value,buffer.length);
                buffer=ans;
                lcl=setTimeout(()=>{
                    subscr(buffer);
                    readState=0;
                    subscr=null;
                },300);
            }
            
        }    
        async function readDouble(){
            let pr=new Promise((resolve,reject)=>{subscr=resolve});
            let res=await pr;
            console.log("got");
            //console.log(res);
            let str=(new TextDecoder).decode(res);
            str=str.split("\r\n")[0];
            let strs=str.split(' ');
            console.log(strs);
            let vals=strs.map((element)=>{return Number.parseFloat(element)});

            console.log(vals);
            return vals;

        }
        function abs(a){
            return Math.abs(a);    
        }
        function min(a,b){
            return Math.min(a,b);    
        }
        function max(a,b){
            return Math.max(a,b);    
        }
        let position =0;
        class Experiment extends React.Component{


            async measure(val){
                position+=val;
                console.log("new measurement");
                


                let writer=globalPort.writable.getWriter();
                await writer.ready;
                //writer.write((new TextEncoder).encode("\r\n"));
                //delay(700);
                //console.log((new TextEncoder).encode("operation "+val.toString()));
                writer.write((new TextEncoder).encode("operation "+val.toString()));
                writer.releaseLock();
                
                let vall=await readDouble();
                return vall;
                
            }
            async measure2(val){
                position+=val;
                console.log("new measurement");
                


                let writer=globalPort.writable.getWriter();
                await writer.ready;
                //writer.write((new TextEncoder).encode("\r\n"));
                //delay(700);
                //console.log((new TextEncoder).encode("operation "+val.toString()));
                writer.write((new TextEncoder).encode("operation "+val.toString()));
                writer.releaseLock();
                
                let res=await readDouble();
                let hold=abs(res[0]-res[1])+abs(res[2]-res[3])+10;

                console.log("RESULT "+res.toString()+" AT "+position.toString());
                if (min(res[0],res[1])-max(res[2],res[3])>hold){
                    return -1;
                }
                else if (min(res[2],res[3])-max(res[1],res[0])>hold){
                        return 1;

                    }
                    else{
                        return 0;

                    }
                
            }
            async measure3(val){
                position+=val;
                console.log("new measurement");
                


                let writer=globalPort.writable.getWriter();
                await writer.ready;
                //writer.write((new TextEncoder).encode("\r\n"));
                //delay(700);
                //console.log((new TextEncoder).encode("operation "+val.toString()));
                writer.write((new TextEncoder).encode("operation "+val.toString()));
                writer.releaseLock();
                
                let res=await readDouble();
                let hold=abs(res[0]-res[1])+abs(res[2]-res[3])+10;

                console.log("RESULT "+res.toString()+" AT "+position.toString());
                if (min(res[0],res[1])-max(res[2],res[3])>2){
                    return -1;
                }
                else if (min(res[2],res[3])-max(res[1],res[0])>2){
                        return 1;

                    }
                    else{
                        return 0;

                    }
                
            }
            constructor(props){
                super(props);
                
            }
            
            async series(){
                let elm=document.getElementById('intext');
                for (let i=0;i<10000;i++){
                    let res=await this.measure(20);
                    console.log("POSITION "+i.toString())
                    console.log(res);

                    let hold=abs(res[0]-res[1])+abs(res[2]-res[3])+10;
                    if (min(res[0],res[1])-max(res[2],res[3])>hold){
                        elm.innerText+="\r\n"+"At position "+i.toString()+" value DOWN";
                    }
                    else if (min(res[2],res[3])-max(res[1],res[0])>hold){
                        elm.innerText+="\r\n"+"At position "+i.toString()+" value UP";

                    }
                    else{
                        elm.innerText+="\r\n"+"At position "+i.toString()+" value UNDEFINED";

                    }
                }
            }
            
            async FindCoarse(step){

                let from,to;

                let prevRes=-1;
                let prevPos=position;
                let res;
                while (true){
                     res=await this.measure2(step);
                     console.log("got "+res.toString()+" at " + position );
                    if (prevRes==1&&res!=1){
                        from=prevPos-step;
                        break;
                    }
                    prevPos=position;
                    prevRes=res;
                }
                while (true){
                    if (prevRes!=-1&&res==-1){
                        to=position+step;
                        break;
                    }
                    prevPos=position;
                    prevRes=res;
                    res=await this.measure2(step);
                }
                return {from,to};
            }
            async GoTo(pos){
                await this.measure2(pos-position);
            }

            async Refine1(from,to){
                while (to-from>1){
                    let med=(from+to)/2;
                    med=Math.floor(med);
                    await this.GoTo(med);
                    let res=await this.measure2(1);
                    console.log("Fine measurement at "+med+" resulting in "+res);
                    if (res==0){
                        return med;
                    }
                    else if (res==1){
                        from=med;
                    }
                    else if (res==-1){
                        to=med;
                    }
                    await delay(800);
                }
                return to;
            }
            async Refine2(center){
                await this.GoTo(center);
                //let rpos=center,lpos=center;
                let confnum=0;

                while (true){
                    await delay(800);
                    let res=await this.measure3(1);
                    if (res==-1){
                        break;
                    }
                }
                while (true){
                    await delay(800);
                    let res=await this.measure3(-1);
                    if (res==-1){
                        break;
                    }
                }
                let rpos=position+1,lpos=position+1;

                while (true){
                    await delay(800);

                    let res=await this.measure3(1);
                    console.log("res "+res);
                    if (res==-1){
                        confnum++;
                    }
                    else {
                        confnum=0;
                        rpos=position;
                    }

                    if (confnum==3){
                        break;
                    }
                }
                confnum=0;
                await this.GoTo(center);
                while (true){
                    await delay(800);

                    let res=await this.measure3(-1);
                    console.log("res "+res);

                    if (res==-1){
                        confnum++;
                    }
                    else {
                        confnum=0;
                        lpos=position;
                    }

                    if (confnum==3){
                        break;
                    }
                }



                return {lpos,rpos};
            }
            async flow(){
                let {from,to}= await this.FindCoarse(20);
                console.log(from);
                console.log(to);

                let rfn1=await this.Refine1(from,to);
                console.log(rfn1);

                let {lpos,rpos}=await this.Refine2(rfn1);
                console.log("GOT FINAL RESULTS OF ("+lpos+","+rpos,")");
                let ans=(lpos+rpos)/2;
                ans=Math.floor(ans);
                await this.GoTo(ans);
            }

            render(){
                return(
                    <div>
                    <button onClick={this.series.bind(this)}>Conduct Experiment</button>
                    <button onClick={this.flow.bind(this)}>Start Main Flow</button>
                    <button onClick={async ()=>{

                        await Comms.SendInfo("setprm 3 1 5");
                        let pr=new Promise(resolve=>{
                            setTimeout(()=>{resolve()},3000);
                        });
                        await pr;
                        console.log("inbound");
                        await Comms.SendInfo("getprm");
                        let res=await Comms.Read();
                        console.log(res);
                    }}>TTS</button>

                    <div id="intext"></div>

                    <div className="sample" >
                        <GeneralInformation></GeneralInformation>    
                    </div>
                    </div>

                    
                )
            }
        }
        async function readInts(){

        }
        class Comms{
            static async SendInfo(data){
                await delay(50);
                let writer=globalPort.writable.getWriter();
                await writer.ready;
                //writer.write((new TextEncoder).encode("\r\n"));
                //delay(700);
                //console.log((new TextEncoder).encode("operation "+val.toString()));
                writer.write((new TextEncoder).encode(data));
                writer.releaseLock();
            }
            static async Read(n){
            
                let pr=new Promise((resolve,reject)=>{subscr=resolve});
                console.log("readable promise created");
            let res=await pr;
            console.log("readable promise resolved");
            console.log("got");
            //console.log(res);
            let str=(new TextDecoder).decode(res);
            return str;
            }



        }


        
        class GeneralInformation extends React.Component{
            

            constructor(props){
                super(props);
                this.green="rgb(64, 255, 175)";
                this.red="rgb(248, 105, 105)";
                this.params={stepport:5,dirport:2,valport:6}
                this.state={allvalid:true,blurActive:false};
                this.savedParams=structuredClone(this.params);
                this.abbr={stepport:"Port to send impulse (digital)",dirport:"Direction port (digital)",valport:"Port to read values (analog)"};
                this.valid={stepport:this.green,dirport:this.green,valport:this.green}
                this.allvalid=true;
                this.refss=new Object();
            }
            set(e){
                e.preventDefault();
                let val=e.target.innerText;
                console.log(val);
                console.log(parseInt(val).toString())
                if (parseInt(val).toString()!=val){
                    console.log(e.target.getAttribute("ident"));
                    this.valid[e.target.getAttribute("ident")]=this.red;

                    let nob=structuredClone(this.params);
                    nob[e.target.getAttribute("ident")]=val;
                    console.log(nob);
                    this.params=nob;
                    console.log("Operaziones");
                    console.log(nob);
                    this.forceUpdate();
                    
                }
                else{
                    this.valid[e.target.getAttribute("ident")]=this.green;
                    let str=e.target.getAttribute("ident");
                    let nob=structuredClone(this.params);
                    nob[str]=parseInt(val);
                    console.log(nob);
                    this.params=nob;
                    this.forceUpdate();
                }
                this.allvalid=true;
                for (let value of Object.values(this.valid)){
                    if (value==this.red){
                        this.allvalid=false;
                    }
                }
                this.setState({allvalid:this.allvalid});
            }
            render(){
                console.log("render");
                console.log(this.state);
                let ops=this.params;
                let arr=[];
                for (let [key,value] of Object.entries(ops)){
                    let nel=<div key={key} className="panelEntry">
                            <div className="panelEntryText"><div className="text"> {this.abbr[key]}</div></div>
                            <div className="flexEmpty"></div>
                            <div key={key} className="panelEntryInput"><div style={{backgroundColor:this.valid[key]}} ref={(rf)=>{this.refss[key]=rf}} onInput={this.set.bind(this)} ident={key.toString()} className="panelEntryInputField" contentEditable="true">{this.savedParams[key].toString()}</div></div>
                        </div>
                    arr.push(nel);
                }
                return(
                <div className="board">
                    <div className={["blurred",this.state.blurActive?"active":null].join(' ')}></div> 
                    <div className="boardHeader">
                        <div className="text">Board Information </div>
                        </div>
                    <div className="panel">
                         {arr}
                         
                    </div>
                    <div className="boardButtons">
                        <Button onClick={async ()=>{
                            if (this.state.allvalid&&JSON.stringify(this.savedParams)!=JSON.stringify(this.params)){
                                this.setState({blurActive:true});

                            let str="setprm "+this.params.stepport.toString()+" "+this.params.dirport.toString()+" "+this.params.valport.toString();
                            await Comms.SendInfo(str);
                            await delay(1500);

                            Comms.SendInfo("getprm");
                            console.log("SENT INFOS");
                            let res=await Comms.Read();
                            console.log("read    "+res);
                            res=res.split("\r\n")[0];
                            res=res.split(' ');
                            this.params.stepport=parseInt(res[0]);
                            this.params.dirport=parseInt(res[1]);
                            this.params.valport=parseInt(res[2]);
                            this.savedParams=structuredClone(this.params);

                            this.setState({blurActive:false});
                            this.forceUpdate();

                            }



                        }} active={this.state.allvalid&&JSON.stringify(this.savedParams)!=JSON.stringify(this.params)}>SAVE</Button>
                        <div className="flexEmpty"></div>
                        <Button onClick={()=>{
                            //let objj=structuredClone(this.params);
                            for (let [key,value] of Object.entries(this.refss)){
                                value.innerText=this.savedParams[key];
                                this.params=structuredClone(this.savedParams);
                                this.valid[key]=this.green;
                            }
                            this.setState({allvalid:true});
                            
                            
                        }} active>DISCARD</Button>
                        </div>
                </div>);
            }
        }


        class Connectivity extends React.Component{
            render(){
                return(
                    <div className="conn">
                        <div className="text">Status: {this.props.status?"CONNECTED":"NOT CONNECTED"}</div>
                        
                        <Button active onClick={this.props.onClick}>{this.props.status?"DISCONNECT":"CONNECT"}</Button>    
                    </div>
                )
            }
        }


        class Button extends React.Component{
            render(){
                return(
                <div className="btn"> 
                    <div onClick={this.props.onClick} className={["btnIn",this.props.active?"active":""].join(' ')}><div className="text">{this.props.children}</div></div>
                </div>); 
            }
        }
        class ConnectButton extends React.Component{
            async connect(){
                if (this.state.connected==false){
                var ports=await navigator.serial.requestPort({});
                console.log(ports);
                await ports.open({
                baudRate:9600
            });
            globalPort=ports;
            if (ports!=null){
                this.setState({connected:true});
                let wrt=globalPort.writable.getWriter();
                wrt.write((new TextEncoder()).encode("\r\n"));
                wrt.releaseLock();
                readglob();
                ports.addEventListener("disconnect",()=>{this.setState({connected:false})});    

            }
            

            }
            else{
                globalPort.close();
                this.setState({connected:false});
                globalPort=null;
                
            }
        }
        
       


            constructor(props){
                super(props);
                this.state={connected:false};
            }
            render(){
                return(
                    <button onClick={this.connect.bind(this)}>{this.state.connected?"DISCONNECT":"CONNECT"}</button>
                )
            }
        }
        ReactDOM.render(<App/>, document.getElementById('main'));