import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  LodingView,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: null,
    page: 1,
    lastPage: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: 20,
      },
    });

    this.setState({
      stars: response.data,
      loading: false,
      lastPage: response.data.length < 20,
      refreshing: false,
    });
  }

  loadMore = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars, page, lastPage } = this.state;

    if (lastPage) return;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: 20,
        page: page + 1,
      },
    });

    this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
      lastPage: response.data.length < 20,
    });
  };

  refreshList = async () => {
    this.setState({ stars: [], page: 1, refreshing: true });
    this.componentDidMount();
  };

  handleNavigate = repo => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repo });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <LodingView>
            <ActivityIndicator size="large" color="#7159c1" />
          </LodingView>
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.3}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
