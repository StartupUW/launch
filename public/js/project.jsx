var Member = React.createClass({
    componentDidMount: function() {
        var user = this.props.member.user;
        var role = this.props.member.role;
        var html = React.renderToString(
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <img src={user.picture}></img>
                    </div>
                    <div className="col-md-6">
                        <p className="name">{user.fname} {user.lname}</p>
                        <p className="grad">{user.major}</p>
                    </div>
                </div>
                <p className="role">{role}</p>
            </div>
        );
        $('#' + user._id).popover({
            html: true,
            content: html,
            trigger: 'hover active focus',
            placement: 'bottom',
        });
    },
    render: function() {
        var user = this.props.member.user;
        var role = this.props.member.role;
        return (
            <a href={"/profile/" + user._id} className="member" id={user._id}>
                {user.fname} {user.lname}
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

        var voteNodes = this.props.votes.map(function(vote) {
            return (
                <div className="col-xs-3 col-sm-2 voter">
                    <img className="img-circle" src={vote.user.picture}></img>
                    <span>{vote.user.fname}</span>
                </div>            
            );
        });

        var tagNodes = project.tags.map(function(tag, index) {
            return(<span className="label label-primary">{tag}</span>);
        });

        return (
            <div id="project-info" className="col-md-8">
                <div className="row basic-info">
                    <div className="title">
                        <div className="col-md-9">
                            <h1>{project.name}</h1>
                            <div className="tags"> { tagNodes }</div>
                            <p>{project.description}</p>
                        </div>
                        <div className="hidden-xs hidden-sm col-md-3">
                            <div className="img-responsive">
                                <img src="/img/suw-logo.png"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="members">{ memberNodes }</div>
                    </div>

                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Upvotes</div>
                    <div className="panel-body">
                        {voteNodes}
                    </div>
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
                <div className="panel panel-default">
                    <div className="panel-heading">Upvotes</div>
                        <div className="panel-body">
                            <p> Website: 
                                <a target="_blank" href={"http://" + project.website}> {project.website} </a>
                            </p>
                            <p> Hiring: {project.hiring ? "Yes": "No"} </p>
                            <p> Posted On: { (new Date(project.date)).toLocaleDateString()} </p>
                        </div>
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

