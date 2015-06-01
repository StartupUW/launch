////////////////////////////////
//   HELPER REACT CLASSES     //
////////////////////////////////

var Editable = React.createClass({displayName: "Editable",
    render: function() {
        if (this.props.editMode) return this.props.input;
        return (React.createElement("span", null, this.props.value));
    }
});

var SaveEditable = React.createClass({displayName: "SaveEditable",
    render: function() {
        if (this.props.editMode) {
            return (
                React.createElement("div", {className: "save-edit"}, 
                    React.createElement("button", {onClick: this.props.submit, className: "btn btn-primary"}, "Save"), 
                    React.createElement("button", {onClick: this.props.cancel, className: "btn btn-default"}, "Cancel")
                )
            );
        }
        return (React.createElement("span", null));
    }
});

var EditSelection = React.createClass({displayName: "EditSelection",
    render: function() {
        if (!this.props.canEdit || this.props.editMode) return (React.createElement("div", null));
        return (
            React.createElement("span", {className: "dropdown " + this.props.dropup}, 
                React.createElement("span", {className: "dropdown-toggle", type: "button", id: "dropdown", "data-toggle": "dropdown", "aria-expanded": "true"}, 
                    React.createElement("span", {className: "edit-project caret"})
                ), 
                React.createElement("ul", {className: "dropdown-menu", role: "menu", "aria-labelledby": "dropdown"}, 
                React.createElement("li", {onClick: this.props.edit, role: "presentation"}, React.createElement("a", {role: "menuitem", tabIndex: "-1"}, "Edit"))
                )
            )
        );
    }
})

////////////////////////////////
//          MAIN              //
////////////////////////////////

var url = "/api/project/" + $("#project-id").val();

var updateProject = function(data) {
    $.ajax({
        url: url,
        method: "PUT",
        data: JSON.stringify(data),
        contentType: 'application/json'
    }).done(function() {
        this.setState({ saved: data, edit: false });
    }.bind(this)).fail(function(err) {
        this.setState({ edit: false });
        console.log(err);
    }.bind(this));
};

$.get(url, function(data) {
    var user = data.user;
    var project = data.project;
    var canEdit = user && project.members.filter(function(member) {
        return member.user._id == data.user._id;
    }).length == 1;

    React.render(
        React.createElement(Project, {url: url, project: project, user: user, canEdit: canEdit}),
        document.getElementById('project-container')
    );

    React.render(
        React.createElement(StatusBar, {url: url, project: project, votes: data.votes, user: user, canEdit: canEdit}),
        document.getElementById('status-bar')
    );
}, 'json')
.fail(function(xhr, status, err) {
    console.log(err);
    $('#project-container h1').html('Project not found');
    loadFacebook();
});

////////////////////////////////
//      REACT COMPONENTS      //
////////////////////////////////

var Project = React.createClass({displayName: "Project",
    componentDidMount: function() {
        loadFacebook();
    },
    render: function() {
        var project = this.props.project;
        if (!project) return React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-xs-12"}, React.createElement("h1", null, "Project Not Found")));
        return React.createElement("div", {className: "row"}, React.createElement(ProjectFeed, React.__spread({},  this.props)));
    }
});

var ProjectFeed = React.createClass({displayName: "ProjectFeed",
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
        updateProject.bind(this, {
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
        return (
            React.createElement("div", {id: "project-feed", className: "col-md-12"}, 
                React.createElement(ProjectBasicInfo, {user: user, project: project, canEdit: canEdit}), 
                React.createElement(ProjectDemo, {user: user, project: project, canEdit: canEdit}), 
                React.createElement(GoogleTimeline, {graphName: "timeline", timeline: project.timeline, canEdit: canEdit}), 
                React.createElement(ProjectMembers, {members: project.members, canEdit: canEdit})
            )
        );
    }
});

var ProjectBasicInfo = React.createClass({displayName: "ProjectBasicInfo",
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
        updateProject.bind(this, {
            name: this.state.inputName,
            description: this.state.inputDescription,
            tags: this.state.inputTags,
        })();
    },
    updateTags: function(tags) {
        console.log(tags);
        this.setState({ inputTags: tags });
    },
    cancel: function() {
        this.setState({ edit: false });
    },
    render: function() {
        var project = this.props.project;
        var canEdit = this.props.canEdit;
        var saved = this.state.saved;
        var editMode = this.state.edit;
        var imgSrc = project.images[0] ? "/uploads/" + project.images[0] : "/img/suw-logo.png";
        var editName = (React.createElement("input", {type: "text", valueLink: this.linkState('inputName'), name: "name"}));
        var editDescription = (React.createElement("textarea", {valueLink: this.linkState('inputDescription'), name: "description"}));
        var descriptionNode = saved.description.split("\n").map(function(p, index) {
            return index == 0 ? (React.createElement("p", null, p)) : (React.createElement("p", null, p, React.createElement("br", null)));
        });
        var tagNodes = this.state.saved.tags.map(function(tag) {
            return(React.createElement("span", {key: tag, className: "label label-primary"}, tag));
        });
        return (
            React.createElement("div", {className: "row basic-info"}, 
                React.createElement("div", {className: "title"}, 
                    React.createElement("div", {className: "col-md-9"}, 
                        React.createElement("h1", null, 
                            React.createElement(Editable, {editMode: editMode, value: saved.name, input: editName}), 
                            React.createElement(EditSelection, {canEdit: canEdit, editMode: editMode, edit: this.edit})
                        ), 
                        React.createElement("div", {className: "tags"}, 
                            React.createElement(Editable, {editMode: editMode, value: tagNodes, input: React.createElement(TagInput, {tags: this.state.inputTags, update: this.updateTags})})
                        ), 
                        React.createElement(Editable, {editMode: editMode, value: descriptionNode, input: editDescription}), 
                        React.createElement(SaveEditable, {editMode: editMode, submit: this.submit, cancel: this.cancel})
                    ), 
                    React.createElement("div", {className: "hidden-xs hidden-sm col-md-3"}, 
                        React.createElement("div", {className: "img-responsive"}, React.createElement("img", {className: "logo", src: imgSrc}))
                    )
                )
            )
    );
    }
})

var TagInput = React.createClass({displayName: "TagInput",
    addTag: function(event) {
        var key = event.keyCode;
        var input = event.target.value;
        var tags = this.props.tags;
        if (input.match(/^\s*\w+ $/)) {
            input = input.trim()
            var newTags = React.addons.update(tags, {
                $push: [input.substr(0, input.length)]
            });
            this.props.update(newTags);
            $('#inputTags').val('');
        }
    },
    tagAction: function() {
        var key = event.keyCode;
        var input = event.target.value;
        var tags = this.props.tags;
        if ((key == 8 || key == 46) && event.target.value === '') {
            // Deletes the last element
            var newTags = tags.filter(function(el, index) {
                return index !== tags.length - 1;
            });
            this.props.update(newTags);
            $('#inputTags').val('');
        } else if (key == 13) {
            event.preventDefault();
            if (!input.match(/^\s*$/)) {
                input = input.trim()
                var newTags = React.addons.update(tags, {
                    $push: [input.substr(0, input.length)]
                });
                this.props.update(newTags);
                $('#inputTags').val('');
            }
        }
    },
    focus: function() {
        $("#inputTags").focus();
    },
    render: function() {
        var tagNodes = this.props.tags.map(function(tag) {
            return (React.createElement("span", {className: "label label-primary"}, tag));
        });
        return(
            React.createElement("div", {id: "tagEditor", onClick: this.focus}, 
                React.createElement("span", null, tagNodes), 
                React.createElement("input", {id: "inputTags", onKeyUp: this.addTag, onKeyDown: this.tagAction, type: "text"})
            )
        );
    }
});

var ProjectDemo = React.createClass({displayName: "ProjectDemo",
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
        updateProject.bind(this, {
            demo: this.state.demoInput
        })();
    }, 
    cancel: function() {
        this.setState({edit: false});
    },
    render: function() {
        var user = this.props.user;
        var demo = this.state.saved.demo;
        var demoNode = (React.createElement("p", null, "No demo added yet!"));
        if (!demo && !this.props.canEdit) {
            return (React.createElement("div", null));
        } else if (demo){
            demoNode = (React.createElement("div", {className: "video-container"}, React.createElement("iframe", {src: demo})));
        } 
        var editMode = this.state.edit;
        var editDemo = (React.createElement("input", {type: "text", name: "demo", valueLink: this.linkState('demoInput')}));
        return (
            React.createElement("div", {className: "project-demo"}, 
                React.createElement("h2", null, "Project Demo",  
                    React.createElement(EditSelection, {canEdit: this.props.canEdit, editMode: editMode, edit: this.edit})
                ), 
                React.createElement(Editable, {value: demoNode, editMode: editMode, input: editDemo}), 
                React.createElement(SaveEditable, {editMode: editMode, submit: this.submit, cancel: this.cancel})
            )
        );
    }
});

var GoogleTimeline = React.createClass({displayName: "GoogleTimeline",
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
            React.createElement("div", {className: "timeline-tooltip"}, 
                React.createElement("h1", null, event.title), 
                React.createElement("p", null, event.description), 
                React.createElement("p", null, event.date.toDateString())
            )
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
        var timelineNode = (React.createElement("p", null, "No timeline events added yet!"));
        if (!this.props.timeline.length && !this.props.canEdit) {
            return (React.createElement("div", null));
        } else if (this.props.timeline.length) {
            timelineNode = (React.createElement("div", {id: this.props.graphName, style: {height: 100, width: "100%"}}));
        }
        return (
            React.createElement("div", null, 
                React.createElement("h2", null, "Milestones"), 
                timelineNode
            )
        );
    }
});

var ProjectMembers = React.createClass({displayName: "ProjectMembers",
    render: function() {
        var memberNodes = this.props.members.map(function(member) {
            return (React.createElement(ProjectMember, {key: member._id, member: member.user}))
        });
        return (
            React.createElement("div", null, 
                React.createElement("h2", null, "Founders"), 
                React.createElement("div", {className: "members row"},  memberNodes )
            )
        );
    }
});

var ProjectMember = React.createClass({displayName: "ProjectMember",
    render: function() {
        var member = this.props.member;
        return (
            React.createElement("div", {className: "member col-xs-12 media"}, 
                React.createElement("div", {className: "media-left"}, React.createElement("img", {className: "img-circle media-object", src: member.picture, height: "60px", width: "60px"})), 
                React.createElement("div", {className: "media-body"}, 
                    React.createElement("a", {href: "/profile/" + member._id}, 
                        React.createElement("h4", {className: "media-heading"}, member.fname + " " + member.lname)
                    ), 
                    React.createElement("p", {className: "bio"}, member.bio)
                )
            )
        );
    }
});

var StatusBar = React.createClass({displayName: "StatusBar",
    render: function() {
        var project = this.props.project;
        var canEdit = this.props.canEdit;
        return (
            React.createElement("div", {className: "row"}, 
                React.createElement(ProjectOverview, React.__spread({project: project},  this.props)), 
                React.createElement(ProjectVotes, React.__spread({},  this.props))
            )
        );
               
    }
})

var ProjectOverview = React.createClass({displayName: "ProjectOverview",
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
        updateProject.bind(this, {
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
        var editMode = this.state.edit;

        var editWebsite = React.createElement("input", {type: "text", name: "website", valueLink: this.linkState('inputWebsite')});
        var defaultWebsite = (
            React.createElement("a", {target: "_blank", href: saved.website}, 
                React.createElement("span", {className: "status-item"}, 
                    React.createElement("span", {className: "text hidden-xs"}, "Website"), 
                    React.createElement("i", {className: "fa fa-external-link"})
                )
            )
        );
        var editableWebsite = React.createElement(Editable, {editMode: editMode, value: defaultWebsite, input: editWebsite});

        var editHiring = React.createElement("input", {type: "checkbox", name: "hiring", checkedLink: this.linkState('inputHiring')});
        var defaultHiring = React.createElement("i", {className: "fa " + (saved.hiring ? "fa-check-circle-o" : "fa-circle-o")});
        var editableHiring = React.createElement(Editable, {editMode: editMode, value: defaultHiring, input: editHiring})

        return (
            React.createElement("div", {className: "col-xs-8"}, 
                React.createElement(SaveEditable, {editMode: editMode, submit: this.submit, cancel: this.cancel}), 
                editableWebsite, 
                React.createElement("span", {className: "status-item"}, React.createElement("span", {className: "text"}, "Hiring"), editableHiring), 
                React.createElement("span", {className: "status-item hidden-xs post-date"}, "Posted on ",  (new Date(project.date)).toLocaleDateString() ), 
                React.createElement(EditSelection, {canEdit: this.props.canEdit, editMode: this.state.edit, edit: this.edit, dropup: "dropup"})
            )
        );
    }
});


var ProjectVotes = React.createClass({displayName: "ProjectVotes",
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
    componentDidMount: function() {
        this.updateModal();
    },
    componentDidUpdate: function() {
        this.updateModal();
    },
    showModal: function() {
        $("#user-votes").modal('show');
    },
    updateModal: function() {
        var voteNodes = this.state.votes.map(function(vote) {
            var user = this.props.user;
            if (!user || (vote.user._id != user._id)) {
                return (
                    React.createElement("li", {className: "list-group-item"}, 
                        React.createElement("a", {href: "/profile/" + vote.user._id}, 
                            React.createElement("img", {className: "img-circle", width: "30px", src: vote.user.picture}), 
                            vote.user.fname + " " + vote.user.lname
                        )
                    )
                );
            }
        }.bind(this));
        React.render(React.createElement("ul", {className: "list-group"}, voteNodes), document.getElementById('user-votes-content'));
    },
    render: function() {
        var votes = this.state.votes;
        var myVote = this.state.myVote;
        var votesNode = (React.createElement("span", null, "Be the first to upvote this!"));
        if (votes.length) {
            var otherVotes = votes.length - (myVote ? 1: 0);
            votesNode = (
                React.createElement("span", null, 
                    myVote ? (React.createElement("span", null, React.createElement("a", {href: "/profile"}, "You"), otherVotes > 0 ? " and " : "")) : "", 
                    otherVotes > 0 ? (React.createElement("a", {onClick: this.showModal}, otherVotes, " other", otherVotes != 1 ? "s": "")) : "", 
                    React.createElement("span", null, " upvoted this project")
                )
            );
        }
        return (
            React.createElement("div", {className: "col-xs-4"}, 
                React.createElement(VoteButton, React.__spread({update: this.updateVotes, myVote: myVote},  this.props)), 
                React.createElement("span", {className: "status-item", id: "votes-container"}, votesNode)
            )
        );
    }
});

var VoteButton = React.createClass({displayName: "VoteButton",
    handleClick: function() {
        if (this.props.user) {
            $.get(url + '/vote', function(data) {
                this.props.update(data.votes, data.voteStatus);
            }.bind(this), 'json')
        }
    },
    componentDidMount: function() {
        if (!this.props.user) {
            $(".vote-large").tooltip({
                title: 'You must sign in to vote on projects!',
                placement: 'top'
            });
        }
    },
    render: function() {
        var myVote = this.props.myVote;
        var className = "vote-large" + (myVote ? " user-voted" : " user-not-voted");
        return (
            React.createElement("div", {onClick: this.handleClick, className: className}, 
                React.createElement("span", {className: "glyphicon glyphicon-heart"}), 
                React.createElement("span", {className: "vote-count hidden-xs"}, "Upvote")
            )
        );
    }
});

/* 
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
*/
