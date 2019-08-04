import User from "../models/user";

export const isolate: Command = {
  run: async (client, msg, args) => {
    await msg.delete();
    args.shift();

    // get the tagged member
    const member = msg.mentions.members.first();
    if (!member)
      return msg.author.send(
        "you had to mention a user in order to isolate them."
      );

    // prepare the reason
    let reason = args.join(" ");
    if (!reason) reason = "No reason specified.";

    // get the member's document from the database
    const doc = await User.findOne({ id: member.user.id }, (err, res) => {
      if (err) return console.error(err);

      return res;
    });

    if (!doc.isolation.isolated) {
      // get an array of the member's roles
      const roles = member.roles.map(r => r.id);

      // remove the roles from the member
      await roles.forEach(role =>
        role !== client.config.roles.isolation
          ? member.roles
              .remove(role, "Isolated.")
              .catch(() => console.error("Rate limited."))
          : null
      );

      // give the member the isolated role
      member.roles.add(client.config.roles.isolation, "Isolated.");

      // update and save the document
      doc.isolation.roles = roles;
      doc.isolation.isolated = true;

      doc.save().catch(error => console.error(error));

      // alert the staff
      const embed = client
        .createEmbed("red")
        .setTitle("Isolated")
        .setDescription(`${member.user.tag} has been isolated.`)
        .addField("Target", member.user, true)
        .addField("Isolated by", msg.author, true)
        .addField("Reason", reason);

      client.bot.channels
        .find(c => c.id === client.config.channels.fk)
        // @ts-ignore
        .send(embed);

      // post a message in the isolated channel
      return (
        client.bot.channels
          .find(c => c.id === client.config.channels.isolation)
          // @ts-ignore
          .send(
            `Hey there, <@!${member.user.id}>. You have been isolated. Don't worry - this doesn't necessarily mean that you have done anything wrong. We have put you here in order to help you calm down if you're feeling bad, or if you are bringing harm to other members of the server. Within this channel there is only you and the staff - feel free to talk to them.`
          )
      );
    } else {
      // get the roles from the database
      const roles = doc.isolation.roles;

      // add all of the roles to the member
      roles.forEach(role =>
        member.roles
          .add(role, "Un-isolated.")
          .catch(() => console.error("Rate limited."))
      );

      // remove the isolated role from the member
      member.roles.remove(client.config.roles.isolation, "Un-isolated.");

      // update and save the document
      doc.isolation.roles = [];
      doc.isolation.isolated = false;

      // alert the staff
      const embed = client
        .createEmbed("green")
        .setTitle("Un-isolated")
        .setDescription(
          `${member.user.tag} has been un-isolated by <@!${msg.author.id}>`
        )
        .addField("Reason", reason);

      client.bot.channels
        .find(c => c.id === client.config.channels.fk)
        // @ts-ignore
        .send(embed);

      return doc.save().catch(error => console.error(error));
    }
  },
  config: {
    name: "isolate",
    module: "Mod",
    description: "Isolates a user!",
    args: true,
    usage: "<@user> *reason*"
  }
};

export default isolate;
