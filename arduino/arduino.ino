#include <KickSort.h>
#include <EEPROM.h>
int dirport=2;
int stepport=5;
int valport=6;

void setup() {
    Serial.begin(9600);      // открываем последовательное соединение

  stepport=EEPROM.read(0);
  dirport=EEPROM.read(1);
  valport=EEPROM.read(2);

  // put your setup code here, to run once:
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(dirport, OUTPUT);
  pinMode(stepport, OUTPUT);
  digitalWrite(dirport,LOW);
  analogWrite(6,211);
  
}
class Measurement;
void autohhd(void*mm);

int lastTime=0;




unsigned int cycle=0;
long positional=0;

int move(int n){
  
  
  //positional+=n;
  digitalWrite(dirport,HIGH);
  if (n<0){
    digitalWrite(dirport,LOW);
    n=-n;
  }
  for (int i=0;i<n;i++){
  digitalWrite(stepport,HIGH);
  digitalWrite(stepport,LOW);
  delay(5);
  
  }
  delay(200);
  //void *mes=new Measurement(1,autohhd);
}

long inits=0;



void multiMeasurement(){
}

void getVal(long double &finans,long double &range){
  
  long sum=0;
  for (int i=0;i<5;i++){
    sum=0;
    for (int j=0;j<500;j++){
      int valll=analogRead(valport);
      sum+=valll;
    }
    Serial.print(sum);
    Serial.print(' ');
    //delay(1); 
    //Serial.println(valll);
    //delay(1);
  }
  finans=(double)sum/400;
  finans=1000000000/((double)sum);
  range=0;
  //delay(800);
  return;
}
void getVal2(long double *finans,int nbr){
  
  long sum=0;
  for (int i=0;i<nbr;i++){
    sum=0;
    for (int j=0;j<500;j++){
      int valll=analogRead(valport);
      sum+=valll;
      
    }
    *(finans+i)=sum;
    //delay(1); 
    //Serial.println(valll);
    //delay(1);
  }
  
  //delay(800);
  return;
}


long prevtime;
long sum=0;
long n=0;
long moved=0;
long long  m=0;
long time=0;
bool fineState=false;
void(* resetFunc) (void) = 0;
int inmove=0;
String strs;
void loop() {
  if (inmove!=0){
    move(inmove);
    inmove=0;
    delay(1000);
  }
 
  /*if (m++%10==0){
  sum+=analogRead(7);
  n++;
  }*/
 /*double a0,b0;
  getVal(a0,b0);
  move(3);
  double a1,a2;
  getVal(a1,a2);
  if (abs(a0-a1)<2){
    Serial.println("UNDEFINED");
  }
  else if (a0>a1){
    Serial.println("DECREASE");
  }
  else{
    Serial.println("INCREASE");
  }*/

  
  if (Serial.available()>0){
  strs=Serial.readStringUntil(' ');
  //Serial.println(strs);
  //Serial.println(strs);
  if (strs=="setprm"){
    
    String stepp=Serial.readStringUntil(' ');
    
    String dirp=Serial.readStringUntil(' ');
    
    String valp=Serial.readString();
    EEPROM.write(0,stepp.toInt());
    EEPROM.write(1,dirp.toInt());
    EEPROM.write(2,valp.toInt());
    Serial.println("CHECKED");
    resetFunc();
    
  }
  if (strs=="getprm"){
    Serial.print(stepport);
    Serial.print(' ');
    Serial.print(dirport);
    Serial.print(' ');
    Serial.println(valport);
  }
  if (strs=="getrotate"){
    byte* a=new byte[4];
    *(a)=EEPROM.read(10);
    *(a+1)=EEPROM.read(11);
    *(a+2)=EEPROM.read(12);
    *(a+3)=EEPROM.read(13);

    double *res=(double*)a;
    Serial.println(*res);
  }
  if (strs=="setrotate"){
     String val=Serial.readString();
     double vl=val.toDouble();
     //Serial.println(vl);
     byte *vll=(byte*)&vl;
     byte a=*vll;
     byte b=*(vll+1);
     byte c=*(vll+2);
     byte d=*(vll+3);
     EEPROM.write(10,a);
     EEPROM.write(11,b);
     EEPROM.write(12,c);
     EEPROM.write(13,d);
     //Serial.println(a);

     
  }
  
  if (strs=="operation"){
    
    String s2=Serial.readStringUntil(' ');
    String s3=Serial.readString();
    int value=s2.toInt();
    int vll=s3.toInt();
    long double v0,v1,v2,v3,temp;
    long double val0[15],val1[15];
    
    getVal2(val0,vll);
    
    move(value);
    delay(150);
    getVal2(val1,vll);
    for (int i=0;i<vll;i++){
      Serial.print((double)val0[i]);
      Serial.print(' ');
    }
    for (int i=0;i<vll;i++){
      Serial.print((double)val1[i]);
      Serial.print(' ');
    }
    
    
    
  }
  else if (strs=="raw"){
    long double a0,temp;
    getVal(a0,temp);
    /*Serial.print("Position ");
    Serial.print(positional);
    Serial.print(" ");*/
    Serial.println((double)a0);
  }
  else if (strs=="expo"){
    long double v0,v1,v2,v3,temp;
    getVal(v0,temp);
    Serial.println((double)v0);
    move(20);
    delay(15);
    getVal(v1,temp);
    Serial.println((double)v1);
    delay(10000);
    getVal(v2,temp);
    Serial.println((double)v2);
    delay(120000);
    getVal(v3,temp);
    Serial.println((double)v3);
    Serial.println((double)((v3-v1)/(v3-v0)));
    
    
  }
  else if (strs == "tst"){
    long double a0,temp,b0;
    //Serial.println("inside");

  getVal(a0,temp);
  move(1);
  long double a1;
  getVal(a1,temp);
  
  move(-1);
  
  long double a2,a3;
  delay(200);
  getVal(a2,temp);
  move(-1);
  getVal(a3,temp);
  
  move(1);
  bool incRight=(a1-a0>3);
  bool incLeft=(a3-a2>3);
  if (incRight&&!incLeft){
    Serial.println("GO LEFT");
    
  }
  else if (incLeft&&!incRight){
    Serial.println("GO RIGHT");
  }
  else{
    Serial.println("UNDEFINED");
  }
  Serial.println((double)(a1-a0));
  Serial.println((double)(a3-a2));
  delay(200);
  //Serial.println("\n\n");
  }
  else{
    int val=strs.toInt();
    move(val);
    //Serial.println("OPS");
  }
  }
  
  
}
