const char *payloadType(int kind,int type) {
    if(kind==0 && type==2)return "bNearSensor";
    if(kind==0 && type==3)return "bKeyboardSensor";
    if(kind==0 && type==4)return "bPropertySensor";
    if(kind==0 && type==6)return "bCollisionSensor";
    if(kind==0 && type==8)return "bRandomSensor";
    if(kind==0 && type==9)return "bRaySensor";
    if(kind==0 && type==10)return "bMessageSensor";
    if(kind==0 && type==13)return "bDelaySensor";
    if(kind==2 && type==0)return "bObjectActuator";
    if(kind==2 && type==1)return "bIpoActuator";
    if(kind==2 && type==6)return "bPropertyActuator";
    if(kind==2 && type==10)return "bEditObjectActuator";
    if(kind==2 && type==11)return "bSceneActuator";
    if(kind==2 && type==14)return "bMessageActuator";
    if(kind==2 && type==19)return "bTwoDFilterActuator";
    return NULL;
}
