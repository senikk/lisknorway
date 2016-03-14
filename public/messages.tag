<messages>
  	<ul class="collection">
    	<li each={ messages } class="collection-item">
      		<p>recipientId: { recipientId }</p>
      		<p>senderId: { senderId }</p>
      		<p>{ asset.message }</p>
    	</li>
	</ul>

	<script>
 		var self = this;
 		var messages = [];
        this.mixin("Helper");

        this.on("mount", function () {
            this.api.get('/messages/list?recipientId=12994786767195560727L')
            .then(function (response) {
                console.log(response.data.response.messages);
                self.messages = response.data.response.messages;
                self.update();
            });
    });
	</script>
</messages>