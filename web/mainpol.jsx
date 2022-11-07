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
      //console.log((new TextDecoder).decode(value.buffer));
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

        let globalres={}
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
                        <div className="copyright">&copy;2022 Vladislav Glazkov </div>
                        <div className="generalWrap">
                    <Connectivity status={this.state.connected} onClick={this.conn.bind(this)}></Connectivity>
                    {this.state.connected==undefined?null:<div>
                    <ConnectButton name="Connect"> </ConnectButton>
                    <br/>
                    
                    <Experiment ref={(rf)=>{globalExp=rf;}}></Experiment></div>
                    
                    }
                    </div>
                    </div>
                );
            }
        }
        class OutputTable extends React.Component{
            constructor(props){
                super(props);
                this.state={data:[]};
            }
            add(value){
                this.state.data.push(value);
                this.forceUpdate();
            }
            convertToCSV(arr) {
                const array = [Object.keys(arr[0])].concat(arr)
              
                return array.map(it => {
                  return Object.values(it).toString()
                }).join('\n')
              }
              
            render(){
                let arr=[];
                arr.push(<div key="up" className="outputParam">
                <div className="outputInner"><div className="text">#</div></div>
                <div className="outputInner"><div className="text">ANGLE</div></div>

            </div>);
                this.state.data.forEach((element,index)=>{
                    arr.push(<div key={index} className="outputParam">
                        <div className="outputInner"><div className="text">{index+1}</div></div>
                        <div className="outputInner"><div className="text">{element}</div></div>

                    </div>)
                });
                return (
                    <div style={{padding:"4px"}} className="board">
                        <h1 className="text">RESULTS TABLE</h1>
                        <br></br>
                        <div>
                        {arr}
                        </div>
                        <Button active onClick={()=>{
                            //let dt=[]
                            let obj=this.state.data.map((element,index)=>{return {"#":index+1,"angle":element}});
                            let str=this.convertToCSV(obj);
                            str="sep=,\r\n"+str;
                            let el=document.createElement("a");
                            document.body.appendChild(el);
                            let fl=new File([str],"table.csv");
                            let link=URL.createObjectURL(fl);
                            el.href=link;
                            el.download="table.csv";

                            el.click();
                        }}>SAVE AS CSV</Button>
                        <Button active onClick={()=>{this.setState({data:[]})}}>CLEAR</Button>
                    </div>
                )
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
                //console.log("got chunk");
                //console.log(value);
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
            //console.log(strs);
            let vals=strs.map((element)=>{return Number.parseFloat(element)});

            //console.log(vals);
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

        let glbnum=0;
        let globalExp;
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
                
                Comms.SendInfo("operation "+val.toString());
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
                

                //Comms.SendInfo("operation "+val.toString());

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
                //Comms.SendInfo("operation "+val.toString());

                
                let res=await readDouble();
                let hold=abs(res[0]-res[1])+abs(res[2]-res[3])+10;

                console.log("RESULT "+res.toString()+" AT "+position.toString());
                if (min(res[0],res[1])-max(res[2],res[3])>0|| (res[0]+res[1])/2-(res[2]+res[3])/2>70){
                    return -1;
                }
                else if (min(res[2],res[3])-max(res[1],res[0])>0|| (res[2]+res[3])/2-(res[0]+res[1])/2>70){
                        return 1;

                    }
                    else{
                        return 0;

                    }
                
            }

            async measureMW(val){
                position+=val;
                let writer=globalPort.writable.getWriter();
                await writer.ready;
                writer.write((new TextEncoder).encode("operation "+val.toString()+" 15"));
                writer.releaseLock();
                let res=await readDouble();
                let res1=[],res2=[];
                res.map((element,index)=>{if (index<15){
                    res1.push(element);
                }
            else{
                res2.push(element);
            }})
                res=res1;
                console.log(res);
                console.log(res2);
                //res.pop();
                res2.pop();
                let finarr=[];
                let n1=15;
                let n2=15;
                res.forEach(elem=>{finarr.push(elem)});
                res2.forEach(elem=>{finarr.push(elem)});
                finarr.sort((a,b)=>{return a-b;});
                let r1=0,r2=0;
                finarr.forEach((element,index)=>{
                    let rank=index+1;
                    if (res.includes(element)){
                        r1+=rank;
                    }
                    else{
                        r2+=rank;
                    }
                });
                console.log("rank sum 1 "+r1);
                console.log("rank sum 2 "+r2);
                let u1=n1*n2+(n1+1)*n1/2-r1;
                let u2=n1*n2+(n2+1)*n2/2-r2;
                let mnm=min(u1,u2);
                console.log("AND THE RESULT OF THE MANN-WITNEY TEST AT "+position);
                
                if (mnm>64){
                    console.log(0);
                    return 0;
                }
                else{
                    if (u1<u2){
                        console.log(1);
                        return 1;
                    }
                    else{
                        console.log(-1);
                        return -1;
                    }

                }
            }
            async measureCoarse(val,thresh){
                position+=val;

                let writer=globalPort.writable.getWriter();
                await writer.ready;
                writer.write((new TextEncoder).encode("operation "+val.toString()+" 1"));
                writer.releaseLock();
                let res=await readDouble();
                res.pop();
                console.log(res[0].toString()+' '+res[1].toString())
                if (res[0]-res[1]>thresh){
                    return 1;
                }
                else if (res[1]-res[0]>thresh){
                    return -1;
                }
                else{
                    return 0;
                }
            }




            constructor(props){
                super(props);
                this.state={ongoing:false,statusText:"",calibrated:false,cancellable:false};  
                glob=(num)=>{
                    if (num>0){
                        this.setState({ongoing:true});
                    }
                    else{
                        this.setState({ongoing:false});
                    }
                } 
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
            
            async FindCoarse(step,thresh){

                let from,to;

                let prevRes=-1;
                let prevPos=position;
                let res;
                //for (let i=0;i<3;i++){
                while (true){
                    if (cancelRequest){
                        return;

                    }
                    res=await this.measureCoarse(step,thresh);
                    console.log("got "+res.toString()+" at " + position );
                     if (prevRes==1&&res!=1){
                        from=prevPos;

                        break;
                    }

                    prevPos=position;
                    prevRes=res;
                }
                while (true){
                    if (cancelRequest){
                        return;

                    }
                    if (prevRes!=-1&&res==-1){
                        to=position;
                        break;
                    }
                    prevPos=position;
                    prevRes=res;
                    res=await this.measureCoarse(step,thresh);
                }
            //}
                return {from,to};
            }
            async GoTo(pos){
                await this.measureCoarse(pos-position);
            }

            async Refine1(from,to){
                while (to-from>4){
                    if (cancelRequest){
                        return;

                    }
                    let med=(from+to)/2;
                    med=Math.floor(med);
                    await this.GoTo(med);
                    let res=await this.measureMW(1);
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
                return Math.floor((to+from)/2);
            }

            async SuperRefine(L,R){
                while (R-L>0){
                    let med=Math.floor((L+R)/2);
                    let r={}
                    r[0]=0;
                    r[1]=0;
                    r[-1]=0
                    let i=0;
                    
                    await this.GoTo(med);

                    while (true){
                        let rr=await this.measureMW(0);
                        if (rr==0){
                            break;
                        }
                        else{
                            await delay(10000);
                        }
                    }
                    let stop=false;
                    while (true){



                    
                    if (i%2==0){
                        await delay(1000);
                        let res=await this.measureMW(1);
                        r[res]++;
                    }
                    else {
                        await delay(1000);
                        let res=await this.measureMW(-1);
                        r[-res]++;

                    }
                    i++;

                    if (r[1]>=2){
                        L=med+1;
                        break;
                    }
                    else if (r[-1]>=2){
                        R=med;
                        break;
                    
                    }
                    else if (r[0]>=10&&stop){
                        return (med+0.5);
                    }
                    else if (r[0]>=10){
                        await delay(35000);
                        r[0]=0;
                        stop=true;
                        //return (med+0.5);
                    }
                }
                }
                return L;

            }
            
            async Refine2(center,msrAll,msrNeed){
                console.log("ENTERING REFINE 2 WITH RESULT OF "+ center.toString());
                let l=center-20;
                let r=center+20;

                let L=l;
                let R=r;
                while (R-L>1){
                    let med=Math.floor((R+L)/2)
                    await this.GoTo(med);
                    let remain=msrAll-msrNeed;
                    let ok=true;
                   
                        if (cancelRequest){
                            return;
                        }
                        await delay(500);
                        let r1=await this.measureMW(1);
                        await delay(300);
                        let r2=await this.measureMW(-1);
                        if (r1==1||r2==1){
                            ok=false;
                        }
                        else if (r1==0&&r2==0){
                            ok=false;
                        }

                        
                    
                    if (ok==true){
                        
                        R=med;
                    }
                    else{
                        L=med;
                    }
                }
                let rpos=R;
                L=center-20;
                R=center+20;
                
                while (R-L>1){
                    let med=Math.floor((R+L)/2)
                    await this.GoTo(med);
                    let remain=msrAll-msrNeed;
                    let ok=true;
                    for (let i=0;i<msrAll;i++){
                        if (cancelRequest){
                            return;
                        }
                        await delay(500);
                        let r1=await this.measureMW(-1);
                        await delay(300);
                        let r2=await this.measureMW(1);
                        if (r1==1||r2==1){
                            ok=false;
                        }
                        else if (r1==0&&r2==0){
                            ok=false;
                        }
                        
                    }
                    if (ok==true){
                        L=med;
                    }
                    else{
                        R=med;
                    }
                }
                let lpos=L;
                return {lpos,rpos};
            }


            
            
            async flow(atz){


                this.setState({cancellable:true});
                let hh=await Comms.RequestQueue();
                this.setState({ongoing:true});
                let varrr=await this.FindCoarse(20,5000);
                if (cancelRequest){
                    cancelRequest=false;
                    //cancelPromise();
                    this.setState({ongoing:false});
                    Comms.ClearQueue(hh);
                    this.setState({cancellable:false});
                    return null;

                }
                let {from,to}= varrr;
                console.log(from);
                console.log(to);
                
                await this.GoTo(from-20);
                let varrr2=await this.FindCoarse(2,1000);
                if (cancelRequest){
                    cancelRequest=false;
                    //cancelPromise();
                    this.setState({ongoing:false});
                    Comms.ClearQueue(hh);
                    this.setState({cancellable:false});
                    return null;

                }
                let from2=varrr2.from;
                let to2=varrr2.to;
                console.log(from2);
                console.log(to2);

                let rfn1=await this.SuperRefine(from2-5,to2+5);
                if (cancelRequest){
                    cancelRequest=false;
                    //cancelPromise();
                    this.setState({cancellable:false});
                    this.setState({ongoing:false});
                    Comms.ClearQueue(hh);
                    return null;

                }
                

                console.log("GOT FINAL RESULTS OF ("+rfn1+")");
                let ans=rfn1;
                let finans=ans;
                //ans=Math.floor(ans);
                await this.GoTo(Math.floor(ans));
                this.setState({ongoing:false});
                this.setState({cancellable:false});

                Comms.ClearQueue(hh);

                if (atz){
                    this.setState({calibrated:true});
                    GlobalData.zeroPos=position;
                    while (GlobalData.zeroPos>GlobalData.val2){
                        GlobalData.zeroPos-=GlobalData.val2;
                    }
                }
                return ans;
            }
            async claimCalibr(){
                this.setState({cancellable:true});
                let hh=await Comms.RequestQueue();
                this.setState({ongoing:true});
                let bp=position
                let rfn1=await this.SuperRefine(position-10,position+10);
                if (cancelRequest){
                    cancelRequest=false;
                    //cancelPromise();
                    this.setState({cancellable:false});
                    this.setState({ongoing:false});
                    Comms.ClearQueue(hh);
                    return null;

                }
                if (abs(bp-rfn1)<=7){
                    GlobalData.zeroPos=rfn1;
                    this.setState({calibrated:true});
                    this.setState({statusText:"SUCCESSFUL"})
                    
                }
                else{
                    this.setState({statusText:"FAILED. PLEASE PASS FULL CALIBRATION"});
                }
                
                this.setState({cancellable:false});
                this.setState({ongoing:false});
                Comms.ClearQueue(hh);
            }
            async returnToCal(){
                this.setState({cancellable:true});
                let hh=await Comms.RequestQueue();
                this.setState({ongoing:true});

                await this.GoTo(Math.floor(GlobalData.zeroPos));

                this.setState({cancellable:false});
                this.setState({ongoing:false});
                Comms.ClearQueue(hh);
            }
            render(){
                return(
                    <div className="main">
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



<button onClick={async ()=>{

while (true){
    Comms.SendInfo("operation 10");
    let res=await Comms.Read(res);
    console.log(res);
}
console.log(res);
}}>TTS2</button>
<button onClick={async ()=>{
    await this.measureMW(1);
}}>MANNWITNEY</button>-->
<button onClick={async ()=>{
    
    while (true){
        
        //await delay(500);
        let rnd=Math.floor(Math.random()*20-10);
        console.log("OPS AT "+rnd);
        await this.GoTo(rnd);
        await delay(500);
        if (Math.random()<0.5){
            let r1=await this.measureMW(1);
            if (globalres[rnd]==undefined){
                globalres[rnd]={}
            }
            if (globalres[rnd][r1]==undefined){
                globalres[rnd][r1]=1;
            }
            else{
                globalres[rnd][r1]++;
            }
        }
        else{
            let r1=await this.measureMW(-1);
            if (globalres[rnd-1]==undefined){
                globalres[rnd-1]={}
            }
            if (globalres[rnd-1][-r1]==undefined){
                globalres[rnd-1][-r1]=1;
            }
            else{
                globalres[rnd-1][-r1]++;
            }
        }
    }
}}>OPS</button>
                    <div id="intext"></div>
                    
                    <div className="sample" >
                        <GeneralInformation inactive={this.state.ongoing}></GeneralInformation> 
                        <RotationInfo FindCoarse={this.FindCoarse.bind(this)} exp={this.flow.bind(this,true)} inactive={this.state.ongoing}></RotationInfo>   
                    </div>
                    <OutputTable ref={(rf)=>{this.otRef=rf;}}></OutputTable>
                    <div className="btnWrap">
                        <Button onClick={async ()=>{
                            await this.flow(true);
                        }} active={true}>{this.state.calibrated?"RECALIBRATE":"CALIBRATE"}</Button>
                        </div>
                        <div className="btnWrap">
                        <Button onClick={async ()=>{
                            let res=await this.flow(false);
                            if (res){
                            console.log(res);
                            console.log(GlobalData.val2);
                            res-=GlobalData.zeroPos;
                            while (res>GlobalData.val2){
                                res-=GlobalData.val2;
                            }
                            let finres=res/GlobalData.val2*180;
                            if (finres>90){
                                finres-=180
                            }
                            this.otRef.add(Number.parseFloat(finres.toFixed(2)));
                            this.setState({statusText:"Measurement completed with the result of "+finres.toFixed(2)+" degrees"});
                            }
                        }} active={this.state.calibrated}>
                            
                            MEASURE
                        </Button>
                        <Button onClick={this.claimCalibr.bind(this)} active>
                            
                            CLAIM CALIBRATED
                        </Button>
                        <Button onClick={this.returnToCal.bind(this)} active={this.state.calibrated}>
                            
                            RETURN TO CALIBRATED
                        </Button>
                        </div>
                    <div className="downpart">
                        
                        <div className="board brd2">                        <pre style={{margin:0}}>{this.state.ongoing?"OPERATION IN PROGRESS...":this.state.statusText+" "}</pre>
                        </div>
                        {this.state.cancellable?
                        <div className="downButtonWrap">

                            <Button active={true} onClick={()=>{cancelRequest=true}}>CANCEL</Button>
                        </div>:null
                        }

                    </div>
                    </div>

                    
                )
            }
        }
        async function readInts(){

        }


        class GlobalData{
            static zeroPos=0;
            static val2=0;
        }

        let lastInQueue=null;
        class Comms{

            static async RequestQueue(){
                glbnum++;
                glob(glbnum);
                let rsv;
                let promise=new Promise((resolve,reject)=>{rsv=resolve});
                let prv=lastInQueue;
                lastInQueue=promise;
                if (prv){
                await prv;
                }
                return rsv;
            }

            static async SendInfo(data){
                //console.log("SENDING "+data);
                await delay(100);
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
            static async ClearQueue(prm){
                glbnum--;
                glob(glbnum);

                prm();
            }



        }

        let glob=null;
        
        class GeneralInformation extends React.Component{
            

            constructor(props){
                super(props);
                this.green="rgb(64, 255, 175)";
                this.red="rgb(248, 105, 105)";
                this.params={stepport:null,dirport:null,valport:null}
                this.state={allvalid:true,blurActive:false};
                this.savedParams=structuredClone(this.params);
                this.abbr={stepport:"Port to send impulse (digital)",dirport:"Direction port (digital)",valport:"Port to read values (analog)"};
                this.valid={stepport:this.green,dirport:this.green,valport:this.green}
                this.allvalid=true;
                this.refss=new Object();
            }


            set(e){
                e.preventDefault();
                
                for (let value of Object.values(this.valid)){
                    if (value==this.red){
                        this.allvalid=false;
                    }
                }
                this.setState({allvalid:this.allvalid});
            }


            async init(){
                this.setState({blurActive:true});
                let req="getprm";
                await delay(1500);
                let hh=await Comms.RequestQueue();

                await Comms.SendInfo("getprm");
                let res=await Comms.Read();
                Comms.ClearQueue(hh);
                console.log(res);
                res=res.split("\r\n")[0];
                res=res.split(' ');
                this.data.stepport=parseInt(res[0]);
                            this.data.dirport=parseInt(res[1]);
                            this.data.valport=parseInt(res[2]);
                this.savedParams=this.data;
                this.tableRef.set(this.data);
                this.setState({blurActive:false});
            }

            componentDidMount(){
                this.tableRef.set(this.params);
                this.onUpdate();

                this.init();

            }
            onUpdate(data){
                if (this.tableRef){
                let ok=true;
                console.log(this.tableRef.valid);
                for (let [key,value] of Object.entries(this.tableRef.valid)){
                    if (value==false){
                        ok=false;
                        break;
                    }
                }
                if (ok){
                    this.setState({allvalid:true});
                }
                else{
                    this.setState({allvalid:false});
                }
                this.data=this.tableRef.get();
                }
            }

            
            render(){
                console.log("render");
                console.log(this.state);
                
                
                return(
                <div className="board">
                    <div className={["blurred",this.state.blurActive||this.props.inactive?"active":null].join(' ')}></div> 
                    <div className="boardHeader">
                        <div className="text">Board Information </div>
                        </div>
                    <div className="panel">
                         <Table updated={this.onUpdate.bind(this)} ref={(rf)=>{this.tableRef=rf}}>
                            <InputField id="stepport" abbr="Port to send impulse (digital)"></InputField>
                            <InputField id="dirport" abbr="Direction port (digital)"></InputField>
                            <InputField id="valport" abbr="Port to read values (analog)"></InputField>
                         </Table>
                         
                    </div>
                    <div className="boardButtons">
                        <Button onClick={async ()=>{
                            if (this.state.allvalid&&JSON.stringify(this.savedParams)!=JSON.stringify(this.data)){
                                this.setState({blurActive:true});

                            
                            let str="setprm "+this.data.stepport.toString()+" "+this.data.dirport.toString()+" "+this.data.valport.toString();
                            let hh=await Comms.RequestQueue();

                            await Comms.SendInfo(str);
                            await delay(1500);

                            Comms.SendInfo("getprm");
                            console.log("SENT INFOS");
                            let res=await Comms.Read();
                            Comms.ClearQueue(hh);

                            console.log("read    "+res);
                            res=res.split("\r\n")[0];
                            res=res.split(' ');
                            this.data.stepport=parseInt(res[0]);
                            this.data.dirport=parseInt(res[1]);
                            this.data.valport=parseInt(res[2]);
                            this.savedParams=structuredClone(this.data);
                            this.tableRef.set(this.data);
                            this.setState({blurActive:false});
                            this.forceUpdate();

                            }



                        }} active={this.state.allvalid&&JSON.stringify(this.savedParams)!=JSON.stringify(this.data)}>SAVE</Button>
                        <div className="flexEmpty"></div>
                        <Button onClick={()=>{
                            //let objj=structuredClone(this.params);
                            this.tableRef.set(this.savedParams);
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

        let cancelRequest=false;
        let cancelPromise=0;

        class Button extends React.Component{
            render(){
                return(
                <div className="btn"> 
                    <div onClick={this.props.onClick} className={["btnIn",this.props.active?"active":""].join(' ')}><div className="text">{this.props.children}</div></div>
                </div>); 
            }
        }


        class Table extends React.Component{
            constructor(props){
                super(props);
                this.refss={}
                this.valid={}
                this.validAll;
            }

            set(data){
                for (let [key,value] of Object.entries(data)){
                    console.log(this.refss);
                    this.refss[key].set(value); 
                }

            }
            handleValid(key,data){
                this.valid[key]=data;
                this.props.updated();
            }
            
            handleValue(key,data){
                this.props.updated();
            }

            get(){
                let ans={}
                for (let [key,value] of Object.entries(this.refss)){
                    ans[key]=value.get();
                }
                return ans;
            }

            render(){
                
                let arr=[];
                React.Children.forEach(this.props.children,(element)=>{
                    //console.log(typeof element);
                    if (["InputField","InputFieldDouble"].includes(element.type.name)){
                        console.log(element.props.key);

                        let nel=React.cloneElement(element,{ref:(rf)=>{this.refss[element.props.id]=rf},setValid:this.handleValid.bind(this),setValue:this.handleValue.bind(this),key:element.props.id});
                        arr.push(nel);
                    }
                })
                return(
                    <div>
                    {arr};
                    </div>
                )
            }
        }

        


        class InputField extends React.Component{
            constructor(props){
                super(props);
                this.state={valid:true};
                
            }
            set(data){
                this.ref.innerText=data;
                this.onChange({target:this.ref});;
            }
            get(){
                return parseInt(this.ref.innerText);
            }
            onChange(e){
                let val=e.target.innerText;
                console.log(val);
                console.log(parseInt(val).toString())
                if (parseInt(val).toString()!=val){
                    this.props.setValid(this.props.id,false);
                    this.setState({valid:false});
                }
                else{
                    this.props.setValid(this.props.id,true);
                    this.props.setValue(this.props.id,parseInt(val).toString());
                    this.setState({valid:true});
                }
                
            }

            render(){
                console.log(this.props);

                return (
                    <div key={this.props.id} className="panelEntry">
                            <div className="panelEntryText"><div className="text"> {this.props.abbr}</div></div>
                            <div className="flexEmpty"></div>
                            <div className="panelEntryInput"><div style={{backgroundColor:(this.state.valid?"rgb(64, 255, 175)":"rgb(248, 105, 105)")}} ref={(rf)=>{this.ref=rf}} onInput={this.onChange.bind(this)} ident={this.props.id.toString()} className="panelEntryInputField" contentEditable="true">{}</div></div>
                        </div>
                )
            }
        }

        class RotationInfo extends React.Component{

            constructor (props){
                super(props);
                this.state={blurActive:false,allvalid:false};
                this.savedParams={val1:0,val2:0};
                this.data=structuredClone(this.savedParams);
            }
            async autodetect(){
                let res1=await this.props.exp();
                if (!res1){
                    return;
                }
                for (let i=0;i<10;i++){
                    await this.props.FindCoarse(40)
                }
                let res2=await this.props.exp();
                if (!res2){
                    return;
                }

                GlobalData.val2=(res2-res1)/11;
                this.savedParams.val2=(GlobalData.val2).toString();
                this.savedParams.val1=(180/(GlobalData.val2)).toFixed(2);
                this.data=structuredClone(this.savedParams);
                this.ref.set(this.data);
            }
            componentDidMount(){
                this.init();
            }
            async init(){

                let hh=await Comms.RequestQueue();

                this.setState({blurActive:true});
                await delay(1500);
                
                Comms.SendInfo("getrotate");
                let res=await Comms.Read();
                Comms.ClearQueue(hh);
                res=res.split("\r\n")[0];
                res=parseFloat(res);
                console.log(res);
                this.setState({blurActive:false});
                this.savedParams.val2=res.toString();
                this.savedParams.val1=(180/res).toFixed(2);
                GlobalData.val2=res;
                this.data=structuredClone(this.savedParams);
                this.ref.set(this.data);
                this.forceUpdate();
            }

            
            
            updated(){
                let dt=this.ref.get();

                

                if (dt.val1!=this.data.val1&&this.ref.valid.val1){

                    

                    this.data.val1=dt.val1.toString();
                    this.data.val2=(180/dt.val1).toFixed(2);
                    this.ref.set(this.data);
                    this.setState({allvalid:true});
                }
                else if (dt.val2!=this.data.val2&&this.ref.valid.val2){
                    this.data.val2=dt.val2.toString();
                    this.data.val1=(180/dt.val2).toFixed(2);
                    this.ref.set(this.data);
                    this.setState({allvalid:true});
                }
                else{
                     for (let val of Object.values(this.ref.valid)){
                        if (val==false){
                            this.setState({allvalid:false});
                        }
                     }
                }
                console.log(this.data);
                console.log(this.savedParams);
                

            }



            render(){
                return (

                    <div className="rotationMain board">
                        <div className={["blurred",this.state.blurActive||this.props.inactive?"active":null].join(' ')}></div> 

                        <div className="">
                            <h1 className="text">Rotaion Settings</h1>
                            <h2 className="text">Enter values manually</h2>
                            <Table ref={(rf)=>{this.ref=rf;}} updated={this.updated.bind(this)}>
                                <InputFieldDouble abbr="Degrees per stepper motor step" id="val1"></InputFieldDouble>
                                <InputFieldDouble abbr="Steps per turnover" id="val2"></InputFieldDouble>
                            </Table>
                            <h2 className="text">or</h2>
                            <div style={{height:"50px"}}></div>
                            <div className="rotBtn">
                            <Button active={true} onClick={this.autodetect.bind(this)}>AUTODETECT</Button>
                            <div className="rotBottom">
                                <Button onClick={async ()=>{
                                    let hh=await Comms.RequestQueue();

                                    let val=this.ref.get().val2;
                                    Comms.ClearQueue(hh);
                                    Comms.SendInfo("setrotate "+val.toString());
                                    await this.init();
                                    
                                    

                                }} active={JSON.stringify(this.data)!=JSON.stringify(this.savedParams)&&this.state.allvalid}>SAVE</Button>
                            </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }



        


        class InputFieldDouble extends React.Component{
            constructor(props){
                super(props);
                this.state={valid:false};
            }
            set(data){
                console.log("set with "+typeof data)
                if (this.ref.innerText!=data){
                this.ref.innerText=data;
                this.onChange({target:this.ref});;
                }
            }
            get(){
                return parseFloat(this.ref.innerText);
            }
            onChange(e){
                let val=e.target.innerText;
                console.log(val);
                console.log(parseFloat(val).toString())
                console.log(parseFloat(val).toFixed(10));
                let rgx="^([0-9]+)(\\.[0-9]+)?$";
                
                if (!val.match(rgx)){
                    this.props.setValid(this.props.id,false);
                    this.setState({valid:false});
                }
                else{
                    this.props.setValid(this.props.id,true);
                    this.props.setValue(this.props.id,parseFloat(val));
                    this.setState({valid:true});
                }
                
            }

            render(){
                console.log(this.props);

                return (
                    <div key={this.props.id} className="panelEntry">
                            <div className="panelEntryText"><div className="text"> {this.props.abbr}</div></div>
                            <div className="flexEmpty"></div>
                            <div className="panelEntryInput"><div style={{backgroundColor:(this.state.valid?"rgb(64, 255, 175)":"rgb(248, 105, 105)")}} ref={(rf)=>{this.ref=rf}} onInput={this.onChange.bind(this)} ident={this.props.id.toString()} className="panelEntryInputField" contentEditable="true">{}</div></div>
                        </div>
                )
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