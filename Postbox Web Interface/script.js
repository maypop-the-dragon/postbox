var titleSize = Postbox.titleSize(), bodySize = Postbox.bodySize();

inputtitle.placeholder = translate("ui.placeholder.title", inputtitle.minLength = titleSize.min, inputtitle.maxLength = titleSize.max);
inputcontent.placeholder = translate("ui.placeholder.content", inputcontent.minLength = bodySize.min, inputcontent.maxLength = bodySize.max);

var noVoteStyles = document.querySelector("#no-vote-styles");
setTimeout(disableNoVoteStyles, Postbox.voteCooldown() * 1000);

function render(post) {
	// Render a post.
	var e, f;
	(e = posts.insertBefore(document.createElement("FIELDSET"), posts.children[0])).className = "post";
	e.innerHTML = post.html;
	(f = e.appendChild(document.createElement("P"))).setAttribute("id", "post-id");
	f.innerText = post.identifier;
	(e = e.appendChild(document.createElement("LEGEND"))).innerHTML = "<span class=\"date\">" + post.posted + "</span> " + ((post.title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<i>Untitled</i>") + "<span title=\"" + pm(post.points) + "\" class=\"vote\"><span class=\"vote-up\">▲</span><span id=\"points\">" + post.points + "</span><span class=\"vote-down\">▼</span></span>";
	e.title = "ID: " + post.identifier;
}

version.innerText = Postbox.version();

function pm(n) {
	// Plus/minus.
	if (n > 0)
		return "+" + n;
	if (n < 0)
		return "-" + n;
	return String(n)
}

Postbox.removeExpiredPosts();
setInterval(Postbox.removeExpiredPosts, 300000); // Remove old posts every ~5 minutes.

function sortFunction(a, b) {
	return (a.date - b.date) + ((a.points - b.points) * 75000);
}

function disableNoVoteStyles() {
	noVoteStyles.disabled = true;
}

function renderPosts() {
	posts.innerHTML = "";

	var p = [];

	var ids = Postbox.allPostIDs();
	for (var i = 0; i < ids.length; i++)
		try {
			p.push(Postbox.read(ids[i]));
		} catch(error) {
		}

	for (var i = 0; i < p.length; i++) {
		render(p[i]);
	}
	p.sort(sortFunction);
}

renderPosts();

addEventListener("click", function(event) {
	if (event.detail === 3) {
		if (event.target.tagName.toUpperCase() === "LI" || event.target.tagName.toUpperCase() === "CODE") {
			document.execCommand("Copy");
			console.info("Copied!");
		}
	} else {
		if (event.target.className.replace("down", "up") === "vote-up" && !Postbox.voteCooldown()) {
			if (event.target.className === "vote-down") {
				Postbox.downvote(event.target.parentElement.parentElement.parentElement.querySelector("#post-id").innerText);
				event.target.parentElement.querySelector("#points").innerText--;
			} else {
				Postbox.upvote(event.target.parentElement.parentElement.parentElement.querySelector("#post-id").innerText);
				event.target.parentElement.querySelector("#points").innerText++;
			}
			renderPosts();
			noVoteStyles.disabled = false;
			setTimeout(disableNoVoteStyles, Postbox.voteCooldown() * 1000);
		}
	}
});