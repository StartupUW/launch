////////////////////////////////
//   HELPER REACT CLASSES     //
////////////////////////////////

var Editable = React.createClass({
    render: function() {
        if (this.props.editMode) {
            return this.props.input;
        }
        return (<span>{this.props.value}</span>);
    }
});

var SaveEditable = React.createClass({
    render: function() {
        if (this.props.editMode) {
            return (
                <div className="save-edit">
                    <button onClick={this.props.submit} className="btn btn-primary">Save</button>
                    <button onClick={this.props.cancel} className="btn btn-default">Cancel</button>
                </div>
                );
        }
        return (<span></span>);
    }
});

var EditSelection = React.createClass({
    render: function() {
        if (!this.props.canEdit || this.props.editMode) {
            return (<div></div>);
        }
        return (
            <span className="dropdown">
                <span className="dropdown-toggle" type="button" id="dropdown" data-toggle="dropdown" aria-expanded="true">
                    <span className="edit-project caret"></span>
                </span>
                <ul className="dropdown-menu" role="menu" aria-labelledby="dropdown">
                <li onClick={this.props.edit} role="presentation"><a role="menuitem" tabIndex="-1" href="#">Edit</a></li>
                </ul>
            </span>
        );
    }
})

var genericSubmit = function(data) {
    $.ajax({
        url: this.props.url,
        method: "PUT",
        data: data,
    }).done(function() {
        this.setState({ 
            saved: data,
            edit: false,
        });
    }.bind(this)).fail(function(err) {
        this.setState({ edit: false });
        console.log(err);
    }.bind(this));
};

///////////////////////////////////
//////////////////////////////////

var url = "/api/project/" + $("#project-id").val();

$.get(url, function(data) {
    var user = data.user;
    var project = data.project;
    var canEdit = user && project.members.filter(function(member) {
        return member.user._id == data.user._id;
    }).length == 1;

    React.render(
        <Project url={url} project={project} user={user} canEdit={canEdit}/>,
        document.getElementById('project-container')
    );

    React.render(
        <StatusBar url={url} project={project} votes={data.votes} user={user} canEdit={canEdit} />,
        document.getElementById('status-bar')
    );
}, 'json')
.fail(function(xhr, status, err) {
    console.log(err);
    loadFacebook();
});

/* Project */
var Project = React.createClass({
    componentDidMount: function() {
        loadFacebook();
    },
    render: function() {
        var project = this.props.project;
        if (!project) {
            return (<div className="row"><div className="col-xs-12"><h1>Project Not Found</h1></div></div>);
        }
        return (
            <div className="row">
                <ProjectFeed {...this.props} />
                <ProjectSidebar {...this.props} />
            </div>
        );
    }
});

/* Project > ProjectFeed */
var ProjectFeed = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        var project = this.props.project;
        return { 
            edit: false,
            saved: { name: project.name, tags: project.tags, description: project.description },
            inputName: project.name,
            inputTags: project.tags,
            inputDescription: project.description,
        }
    },
    edit: function() {
        this.setState({ edit: true });
    },
    submit: function() {
        genericSubmit.bind(this, {
            name: this.state.inputName,
            description: this.state.inputDescription,
            tags: this.state.inputTags,
        })();
    },
    cancel: function() {
        this.setState({ edit: false });
    },
    render: function() {
        var project = this.props.project;
        var user = this.props.user;
        var canEdit = this.props.canEdit;
        var saved = this.state.saved;
        var editMode = this.state.edit;
        var imgSrc = project.images[0] ? "/uploads/" + project.images[0] : "/img/suw-logo.png";
        var editName = (<input type="text" valueLink={this.linkState('inputName')} name="name"/>);
        var editDescription = (<textarea valueLink={this.linkState('inputDescription')} name="description"/>);
        var descriptionNode = saved.description.split("\n").map(function(p, index) {
            return index == 0 ? (<p>{p}</p>) : (<p>{p}<br/></p>);
        });
        return (
            <div id="project-feed" className="col-md-8">
                <div className="row basic-info">
                    <div className="title">
                        <div className="col-md-9">
                            <h1>
                                <Editable editMode={editMode} value={saved.name} input={editName}/>
                                <EditSelection canEdit={this.props.canEdit} editMode={editMode} edit={this.edit} />
                            </h1>
                            <ProjectTags tags={project.tags}/>
                            <Editable editMode={editMode} value={descriptionNode} input={editDescription}/>
                            <SaveEditable editMode={editMode} submit={this.submit} cancel={this.cancel}/>
                        </div>
                        <div className="hidden-xs hidden-sm col-md-3">
                            <div className="img-responsive"><img className="logo" src={imgSrc}/></div>
                        </div>
                    </div>
                </div>
                <ProjectDemo user={user} project={project} canEdit={canEdit} url={this.props.url}/>
                <GoogleTimeline graphName="timeline" timeline={project.timeline} canEdit={canEdit} url={this.props.url}/>
            </div>
        );
    }
});

/* Project > ProjectFeed > ProjectTags*/
var ProjectTags = React.createClass({
    render: function() {
        var tagNodes = this.props.tags.map(function(tag) {
            return(<span key={tag} className="label label-primary">{tag}</span>);
        });
        return (<div className="tags">{ tagNodes }</div>);
    }
});

/* Project > ProjectFeed > ProjectDemo */
var ProjectDemo = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        var demo = this.props.project.demo;
        return { 
            edit: false, 
            saved: { demo: demo },
            demoInput: demo,
        };
    },
    edit: function() {
        this.setState({edit: true});
    },
    submit: function() {
        genericSubmit.bind(this, {
            demo: this.state.demoInput
        })();
    }, 
    cancel: function() {
        this.setState({edit: false});
    },
    render: function() {
        var user = this.props.user;
        var demo = this.state.saved.demo;
        var demoNode = (<p>No demo added yet!</p>);
        if (!demo && !this.props.canEdit) {
            return (<div></div>);
        } else if (demo){
            demoNode = (<iframe src={demo} width="100%" height="400px" />);
        } 
        var editMode = this.state.edit;
        var editDemo = (<input type="text" name="demo" valueLink={this.linkState('demoInput')}/>);
        return (
            <div className="project-demo">
                <h2>Project Demo 
                    <EditSelection canEdit={this.props.canEdit} editMode={editMode} edit={this.edit}/>
                </h2>
                <Editable value={demoNode} editMode={editMode} input={editDemo}/>
                <SaveEditable editMode={editMode} submit={this.submit} cancel={this.cancel}/>
            </div>
        );
    }
});

var GoogleTimeline = React.createClass({
    getInitialState: function() {
        return ({ loaded: false });
    },
    componentDidMount: function() {
        google.load('visualization', '1.1', {
            packages: ['timeline'],
            callback: function() {
                this.setState({loaded: true });
                this.drawCharts(); 
            }.bind(this),
        });
    },
    componentDidUpdate: function() {
        this.drawCharts();
    },
    getTooltip: function(event, date) {
        return React.renderToString((
            <div className="timeline-tooltip">
                <h1>{event.title}</h1>
                <p>{event.description}</p>
                <p>{event.date.toDateString()}</p>
            </div>
        ));
    },
    drawCharts: function() {
        if (this.state.loaded && this.props.timeline.length) {
            var dataTable = new google.visualization.DataTable();

            dataTable.addColumn({ type: 'string', id: 'Type' });
            dataTable.addColumn({ type: 'string', id: 'Title' });
            dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': {html: true}});
            dataTable.addColumn({ type: 'date', id: 'Start' });
            dataTable.addColumn({ type: 'date', id: 'End' });

            var rows = this.props.timeline.map(function(event) {
                event.date = new Date(event.date);
                return ['Event', event.title, this.getTooltip(event), event.date, event.date];
            }.bind(this));

            var today = new Date();

            rows.push(['Event', 'Today', this.getTooltip({
                title: "Today", description: "What an awesome day!", date: today,
            }), today, today]);

            dataTable.addRows(rows);

            var options = {
                timeline: { groupByRowLabel: true },
                tooltip: { isHtml: true },
            };

            var chart = new google.visualization.Timeline(
              document.getElementById(this.props.graphName)
            );

            chart.draw(dataTable, options);
        }
    },    
    render: function() {
        var timelineNode = (<p>No timeline events added yet!</p>);
        if (!this.props.timeline.length && !this.props.canEdit) {
            return (<div></div>);
        } else if (this.props.timeline.length) {
            timelineNode = (<div id={this.props.graphName} style={{height: 100, width: "100%"}}></div>);
        }
        return (
            <div>
                <h2>Milestones</h2>
                {timelineNode}
            </div>
        );
    }
});

/* Project > ProjectSidebar */
var ProjectSidebar = React.createClass({
    render: function() {
        var project = this.props.project;
        return (
            <div id="project-sidebar" className="col-md-4">
                <ProjectOverview project={project} {...this.props} />
                <FacebookPage page={project.fbPage} />
            </div>
        );
    }
});

/* Project > ProjectSidebar > ProjectOverview */
var ProjectOverview = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        var project = this.props.project;
        return { 
            edit: false,
            saved: { 
                website: project.website,
                hiring: project.hiring
            },
            inputWebsite: project.website,
            inputHiring: project.hiring
        };
    },
    edit: function() {
        this.setState({ edit: true });
    },
    submit: function() {
        genericSubmit.bind(this, {
            website: this.state.inputWebsite,
            hiring: this.state.inputHiring,
        })();
    },    
    cancel: function() {
        this.setState({ edit: false });
    },
    render: function() {
        var project = this.props.project;
        var saved = this.state.saved;
        var editWebsite = (<input type="text" name="website" valueLink={this.linkState('inputWebsite')}/>);
        var editHiring = (<input type="checkbox" name="hiring" checkedLink={this.linkState('inputHiring')}/>);
        var editWebsiteNode = (<Editable editMode={this.state.edit} value={"Visit"} input={editWebsite}/>);
        var websiteNode = (                        
            <a target="_blank" href={saved.website}>{editWebsiteNode}</a>
        );
        if (this.state.edit) {
            websiteNode = editWebsiteNode;
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    Overview
                    <EditSelection canEdit={this.props.canEdit} editMode={this.state.edit} edit={this.edit}/>
                </div>
                <div className="panel-body">
                    <p>Website:&nbsp;
                        {websiteNode}
                    </p>
                    <p>Hiring:&nbsp;
                        <Editable editMode={this.state.edit} value={saved.hiring ? "Yes": "No"} input={editHiring}/>
                    </p>
                    <p>Posted On: { (new Date(project.date)).toLocaleDateString() }</p>
                    <SaveEditable editMode={this.state.edit} submit={this.submit} cancel={this.cancel}/>
                </div>
            </div>
        );
    }
});

var StatusBar = React.createClass({
    render: function() {
        var project = this.props.project;
        var canEdit = this.props.canEdit;
        return (
            <div className="row">
                <ProjectMembers members={project.members} canEdit={canEdit} url={this.props.url} />
                <div className="col-xs-4 col-md-4 social">
                    <ProjectVotes {...this.props} />
                </div>
            </div>
        );
               
    }
})

/* Project > ProjectFeed > ProjectMembers */
var ProjectMembers = React.createClass({
    render: function() {
        var memberNodes = this.props.members.map(function(member) {
            return (<ProjectMember key={member._id} member={member.user} />)
        });
        return (
            <div className="members col-xs-8 col-md-8">
                { memberNodes }
            </div>
        );
    }
});


/* Project > ProjectFeed > ProjectMembers > ProjectMember  */
var ProjectMember = React.createClass({
    render: function() {
        var member = this.props.member;
        return (
            <div className="member media">
                <div className="media-left"><img className="img-circle media-object" src={member.picture} width="30px"></img></div>
                <div className="media-body hidden-xs hidden-sm">
                    <a href={"/profile/" + member._id}>
                        <p className="media-heading">
                            {member.fname + " " + member.lname}
                        </p>
                    </a>
                </div>
            </div>
        );
    }
});


/* Project > ProjectFeed > ProjectVotes */
var ProjectVotes = React.createClass({
    getInitialState: function() {
        var votes = this.props.votes;
        var user = this.props.user;
        var myVote = user && votes.filter(function(el) {
            return el.user._id === user._id;
        }).length === 1;
        return { votes: votes, myVote: myVote };
    },
    updateVotes: function(votes, myVote) {
        this.setState({ votes: votes, myVote: myVote });
    },
    render: function() {
        var votes = this.state.votes;
        var voteNodes = (<span>Be the first to upvote this!</span>);
        var myVote = this.state.myVote;
        if (votes.length) {
            voteNodes = (<span className="hidden-xs hidden-sm">{myVote ? "You and " : ""} {votes.length - (myVote ? 1: 0) } other{votes.length > 1 ? "s": ""} upvoted this project</span>);
        }
        return (
            <div id="votes-container">
                {voteNodes}
                <VoteButton update={this.updateVotes} myVote={myVote} {...this.props} />
            </div>
        );
    }
});

/* Project > ProjectSidebar > ProjectOverview > VoteButton */
var VoteButton = React.createClass({
    handleClick: function() {
        if (this.props.user) {
            $.get(this.props.url + '/vote', function(data) {
                this.props.update(data.votes, data.voteStatus);
            }.bind(this), 'json')
        }
    },
    render: function() {
        var myVote = this.props.myVote;
        var className = "vote-large" + (myVote ? " user-voted" : " user-not-voted");
        return (
            <div onClick={this.handleClick} className={className}>
                <span className="glyphicon glyphicon-heart"></span>
                <span className="vote-count">Upvote</span>
            </div>
        );
    }
});

/* Project > ProjectSidebar > ProjectOverview > SocialShares*/
var SocialMedia = React.createClass({
    render: function() {
        return (
            <div id="fb-share">
                <div className="fb-send" data-href={window.location.href}></div>
                <div className="fb-like" data-href={window.location.href} data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>
            </div>
        )
    }
})

/* Project > ProjectSidebar > ProjectOverview > FacebookPage */
var FacebookPage = React.createClass({
    render: function() {
        var page = this.props.page;
        if (page) {
            return (
                <div className="fb-page" data-href={page} data-width="300" data-hide-cover="true" data-show-facepile="true" data-show-posts="false">
                    <div className="fb-xfbml-parse-ignore">
                        <blockquote cite={page}><a href={page}></a></blockquote>
                    </div>
                </div>
            );
        }
        return (<div></div>);
    }
});
