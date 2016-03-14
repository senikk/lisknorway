<message>
    <actions title="message"></actions>

	<ul class="collection with-header">
    	<li class="collection-header">
            SIMPLE MESSAGE TESTING DAPP
    	</li>
    	<li class="collection-item">
            <label>Message</label>
            <input name="message" />
            <button onclick={send}>SEND MESSAGE</button>
        </li>
        <li class="collection-item">
            <messages></messages>
        </li>
 	</ul>

	<script>
 		var self = this;
        this.mixin("Helper");

        send(e) {
            this.api.put('/messages/add', {
                recipientId: "12994786767195560727L",
                message: self.message.value,
                secret: "senikk" 
            });
        }
	</script>
</message>