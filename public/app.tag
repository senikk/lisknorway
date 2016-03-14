<app>
	<message if={ tag == 'message'}></message>

	<script>
		var self = this;
		this.mixin('Helper');
	
		riot.route(function(action) {
			self.update({tag: action || 'message'});
		});
	</script>
</app>