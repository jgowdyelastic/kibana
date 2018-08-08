/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */


import PropTypes from 'prop-types';
import React, {
  Component,
} from 'react';

import {
  EuiButton,
  EuiPopover,
  EuiPopoverTitle,
  EuiButtonIcon,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';

import { cloneDeep } from 'lodash';

import './styles/main.less';
import { ml } from '../../../../../services/ml_api_service';
import { GroupList } from './group_list';
import { NewGroupInput } from './new_group_input';

function createSelectedGroups(jobs, groups) {
  const jobIds = jobs.map(j => j.id);
  const groupCounts = {};
  jobs.forEach((j) => {
    j.groups.forEach((g) => {
      if (groupCounts[g] === undefined) {
        groupCounts[g] = 0;
      }
      groupCounts[g]++;
    });
  });

  const selectedGroups = groups.reduce((p, c) => {
    if (c.jobIds.some(j => jobIds.includes(j))) {
      p[c.id] = {
        partial: (groupCounts[c.id] !== jobIds.length),
      };
    }
    return p;
  }, {});

  return selectedGroups;
}

export class GroupSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPopoverOpen: false,
      groups: [],
      selectedGroups: {},
      edited: false,
    };

    this.refreshJobs = this.props.refreshJobs;
  }

  static getDerivedStateFromProps(props, state) {
    if (state.edited === false) {
      const selectedGroups = createSelectedGroups(props.jobs, state.groups);
      return { selectedGroups };
    } else {
      return {};
    }
  }

  togglePopover = () => {
    if (this.state.isPopoverOpen) {
      this.closePopover();
    } else {
      ml.jobs.groups()
        .then((groups) => {
          const selectedGroups = createSelectedGroups(this.props.jobs, groups);

          this.setState({
            isPopoverOpen: true,
            edited: false,
            selectedGroups,
            groups,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  closePopover = () => {
    this.setState({
      edited: false,
      isPopoverOpen: false,
    });
  }

  selectGroup = (group) => {
    const newSelectedGroups = cloneDeep(this.state.selectedGroups);

    if (newSelectedGroups[group.id] === undefined) {
      newSelectedGroups[group.id] = {
        partial: false,
      };
    } else if (newSelectedGroups[group.id].partial === true) {
      newSelectedGroups[group.id].partial = false;
    } else {
      delete newSelectedGroups[group.id];
    }

    this.setState({
      selectedGroups: newSelectedGroups,
      edited: true,
    });
  }

  applyChanges = () => {
    const { selectedGroups } = this.state;
    const { jobs } = this.props;
    const newJobs = jobs.map(j => ({
      id: j.id,
      oldGroups: j.groups,
      newGroups: [],
    }));

    for (const gId in selectedGroups) {
      if (selectedGroups.hasOwnProperty(gId)) {
        const group = selectedGroups[gId];
        newJobs.forEach((j) => {
          if (group.partial === false || (group.partial === true && j.oldGroups.includes(gId))) {
            j.newGroups.push(gId);
          }
        });
      }
    }

    const tempJobs = newJobs.map(j => ({ job_id: j.id, groups: j.newGroups }));
    ml.jobs.updateGroups(tempJobs)
    	.then(() => {
        this.refreshJobs();
        this.closePopover();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  addNewGroup = (id) => {
    const newGroup = {
      id,
      calendarIds: [],
      jobIds: [],
    };

    const groups = this.state.groups;
    if (groups.some(g => g.id === newGroup.id) === false) {
      groups.push(newGroup);
    }

    this.setState({
      groups,
    });
  }

  render() {
    const {
      groups,
      selectedGroups,
      edited,
    } = this.state;
    const button = (
      <EuiButtonIcon
        iconType="indexEdit"
        aria-label="Manage job groups"
        onClick={() => this.togglePopover()}
      />
    );
    const s = (this.props.jobs.length > 1 ? 's' : '');

    return (
      <EuiPopover
        id="trapFocus"
        ownFocus
        button={button}
        isOpen={this.state.isPopoverOpen}
        closePopover={() => this.closePopover()}
      >
        <div className="group-selector">
          <EuiPopoverTitle>Apply groups to job{s}</EuiPopoverTitle>

          <GroupList
            groups={groups}
            selectedGroups={selectedGroups}
            selectGroup={this.selectGroup}
          />

          <EuiHorizontalRule margin="xs" />
          <EuiSpacer size="s"/>

          <NewGroupInput
            addNewGroup={this.addNewGroup}
          />

          <EuiHorizontalRule margin="m" />
          <div>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={this.applyChanges}
                  isDisabled={(edited === false)}
                >
                  Apply
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </div>
      </EuiPopover>
    );
  }
}
GroupSelector.propTypes = {
  jobs: PropTypes.array.isRequired,
  refreshJobs: PropTypes.func.isRequired,
};
