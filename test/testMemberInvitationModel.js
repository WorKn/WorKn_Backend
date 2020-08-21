const MemberInvitation = require('../models/memberInvitationModel');
const testModel = require('./testModel');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');


newGoodElement = async (name) =>{
    const invitationToken = crypto.randomBytes(32).toString('hex');
    var invitation = await MemberInvitation.create({
        organization: "5f2f6f288b0610305489857e",
        email: "invitedEmail@email.com",
        token: invitationToken,
        invitedRole: "member"
    });
    if(await invitation.validateToken(invitationToken,invitation.token)){
        console.log("Token aprovado: "+invitationToken);
    }else{
        console.log("token inválido, rechazado: "+invitationToken);
    }
    if(await invitation.validateToken("invitationToken",invitation.token)){
        console.log("token aprovado: "+ "invitationToken");
    }else{
        console.log("token inválido, rechazado: "+ "invitationToken");
    }
}
    
/*
const newBadElement = await MemberInvitation.create({
    organization: '5f2f6f288b0610305489857e',
    email: 'workn2@work.com',
    token: invitationToken,
    invitedRole: "member"
});*/


newGoodElement("member");