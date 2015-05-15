var Member = React.createClass({
    componentDidMount: function() {
        var member = this.props.member.member;
        var role = this.props.member.role;
        var html = React.renderToString(
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <img src={member.picture}></img>
                    </div>
                    <div className="col-md-6">
                        <p className="name">{member.fname} {member.lname}</p>
                        <p className="grad">{member.major}</p>
                    </div>
                </div>
                <p className="role">{role}</p>
            </div>
        );
        $('#' + member._id).popover({
            html: true,
            content: html,
            trigger: 'hover active focus',
            placement: 'bottom',
        });
    },
    render: function() {
        var member = this.props.member.member;
        var role = this.props.member.role;
        return (
            <a href={"/profile/" + member._id} className="member" id={member._id}>
                {member.fname} {member.lname}
            </a>
        );
    }
});

var VoteButton = React.createClass({
    getInitialState: function() {
        var user = this.props.user;
        var voted = false;
        if (user) {
            voted = this.props.votes.filter(function(el) {
                return el.user === user._id;
            }).length === 1;
        }
        return {
            numVotes: this.props.votes.length || 0,
            voted: voted
        };
    },
    componentDidMount: function() {
        $(".cannot-vote").tooltip({
            title: 'You must sign in to vote on projects!',
            placement: 'bottom'
        });
    },
    handleClick: function() {
        if (this.props.user) {
            $.get('/api/project/' + this.props.id + '/vote')
                .done(function(data) {
                    //this.props.refreshVotes(data.voteStatus);
                    this.setState({
                        numVotes: this.state.numVotes + (data.voteStatus ? 1: -1),
                        voted: data.voteStatus
                    });
                }.bind(this))
        }
    },
    render: function() {
        var user = this.props.user;
        var numVotes = this.state.numVotes;
        var className = "votes-large";
        className += this.state.voted ? " user-voted" : " user-not-voted";
        className += user ? " can-vote" : " cannot-vote";

        return (
            <a onClick={this.handleClick} className={className}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count"> {numVotes > 0 ? numVotes : ""}</span>
            </a>
        );
    }
});


var ProjectInfo = React.createClass({
    render: function() {
        var project = this.props.project;
        var memberNodes = this.props.members.map(function(member) {
            return (<Member member={member} />);
        });
        return (
            <div id="project-info" className="col-md-8">
                <h1>{project.name}
                </h1>
                <VoteButton id={project._id} user={this.props.user} votes={this.props.votes}></VoteButton>
                <div className="members">
                    <h2>Members</h2>
                    { memberNodes }
                </div>
                <div className="description">
                    <h2>About</h2>
                    <p>{project.description}</p>
                </div>
            </div>
        );
    }
});


var ProjectFeed = React.createClass({
    render: function() {
        var project = this.props.project;
        var fbNode = '';
        if (project.fbPage) {
            fbNode = (
                <div className="fb-page" data-href={project.fbPage} data-width="350" data-hide-cover="true" data-show-facepile="true" data-show-posts="false">
                    <div className="fb-xfbml-parse-ignore">
                        <blockquote cite={project.fbPage}>
                            <a href={project.fbPage}></a>
                        </blockquote>
                    </div>
                </div>
            );
        }
        return (
            <div id="project-feed" className="col-md-4">
                <div className="contact-info">
                    <p> Website: 
                        <a target="_blank" href={"http://" + project.website}> {project.website} </a>
                    </p>
                    <p> Hiring: {project.hiring ? "Yes": "No"} </p>
                    <p> Posted On: { (new Date(project.date)).toLocaleDateString()} </p>
                </div>
                { fbNode }
            </div>
        );
    }
});


var Project = React.createClass({
    getInitialState: function() {
        return {
            project: null,
            members: null,
            votes: null,
            user: null,
        }
    },
    componentDidMount: function() {
        $.get(this.props.url, function(data) {
            console.log(data);
            this.setState({
                project: data.project,
                members: data.members,
                votes: data.votes,
                user: data.user,
            });
        }.bind(this), 'json')
        .fail(function(xhr, status, err) {
            console.log(err);
        });
    },
    render: function() {
        if(!this.state.project) {
            return (
                <h1> Project Not Found </h1>
            );
        }
        return (
            <div className="row">
                <ProjectInfo user={this.state.user} votes={this.state.votes} project={this.state.project} members={this.state.members} />
                <ProjectFeed project={this.state.project} fbPage={this.state.project.fbPage} />
            </div>
        );
    }
});

React.render(
    <Project url={"/api/project/" + $("#project-id").val()}/>,
    document.getElementById('project-container')
);

