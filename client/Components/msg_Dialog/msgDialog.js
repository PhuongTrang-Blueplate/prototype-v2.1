import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Blaze } from 'meteor/blaze';




Template.msgDialog_content.onRendered(function(){
  if(Meteor.userId()){
    FlowRouter.go('/msgDialog');

    var data = Profile_details.find({'user_id': Meteor.userId()});
    if(data.count()){
    Blaze.render(Template.profile_card, document.getElementById('profile'));
    }

    else{
    Blaze.render(Template.create_profile, document.getElementById('profile'));
}
  } else {
    FlowRouter.go('/login');
  }
});

Template.msgDialog_navbar.events({
  'click .brand-logo': function(){
    Meteor.call('messages.clear', Meteor.userId());
    console.log("Logout");
    Meteor.logout(function(err){
      if (err) {
        Bert.alert(err.reason, "danger", "growl-top-right");
      } else {
        Session.clear();
        FlowRouter.go('/');
        Bert.alert("you are now logged out", "success", "growl-top-right");
      }
    });
  }
});

// Accounts config
Messages = new Mongo.Collection('messages');

Template.msgDialog_content.onRendered(function () {
  Meteor.setTimeout(function() {
    var message_window = $("#messages_wrap").height();
    $(".conversation-screen").animate({scrollTop:message_window},0);
  }, 800);
});

Template.msgDialog_content.helpers({
  'messages':function() {
    return Messages.find({"channel": Meteor.userId()});
  },
  'render_component': function() {
    var latest_message =  Messages.findOne({"channel": Meteor.userId()},{sort:{createdAt: -1, limit:1}});
    return latest_message && String(latest_message.component);
  }
});

Template.message.helpers({
  'message_owner':function() {
    if (this.owner == Meteor.userId()) {
      return true;
    };
  }
});

Template.chips.helpers({
  'chips_content':function() {
    return Messages.findOne({"channel":Meteor.userId()},{sort:{createdAt: -1, limit:1,}});
  }
});

Template.chips.events({
  'click .chips_action': function() {
    event.preventDefault();

    const target = event.target;
    const chips_input = target.value;

    Meteor.call('messages.insert', chips_input, Meteor.userId(), Meteor.userId());
    var message_window = $("#messages_wrap").height();
    $(".conversation-screen").animate({scrollTop:message_window},500);

    Meteor.call('apiai.response',chips_input);
    var message_window = $("#messages_wrap").height();
    $(".conversation-screen").animate({scrollTop:message_window},500);
  }
});

Template.add.events({
  'submit .send-message': function(){
    event.preventDefault();
    const target = event.target;
    const text = target.new_message.value;

    Meteor.call('apiai.response',text);
    var message_window = $("#messages_wrap").height();
    $(".conversation-screen").animate({scrollTop:message_window},500);

    Meteor.call('messages.insert', text,Meteor.userId(), Meteor.userId());
    // Clear form
    target.new_message.value = '';
    // Get message dialog to move to the bottom after message submitted
    var message_window = $("#messages_wrap").height();
    $(".conversation-screen").animate({scrollTop:message_window},500);
  }
});
