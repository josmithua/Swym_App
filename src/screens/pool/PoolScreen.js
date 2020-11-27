import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SectionList, Text } from 'react-native';
import PropTypes from 'prop-types';
import Navbar from '../../components/Navbar';
import { fetchPoolResultsHistory, fetchPoolState } from '../../utils/networking/API';
import Colors from '../../utils/styling/Colors';
import PoolResultsHistoryCard from '../../components/pool/PoolResultsHistoryCard';
import EstimatedPrizeSection from './EstimatedPrizeSection';
import TotalSavingsSection from './TotalSavingsSection';
import NavigationShape from '../../data/shapes/Navigation';

export const SectionKind = Object.freeze({
  ESTIMATED_PRIZE: 'ESTIMATED_PRIZE',
  COUNTDOWN: 'COUNTDOWN',
  TOTAL_SAVINGS: 'TOTAL_SAVINGS',
  POOL_HISTORY: 'POOL_HISTORY',
});

function sectionListItemKeyExtractor(index) {
  return index;
}

const PoolScreen = ({ navigation, logout }) => {
  const [poolResultsHistory, setPoolResultsHistory] = useState([]);
  const [isFetchingPoolResultsHistory, setIsFetchingPoolResultsHistory] = useState(false);
  const [poolResultsHistoryFetchError, setHasPoolResultsHistoryFetchError] = useState(false);

  const [poolState, setPoolState] = useState(null);
  const [isFetchingPoolState, setIsFetchingPoolState] = useState(false);
  const [poolStateFetchError, setHasPoolStateFetchError] = useState(false);

  useEffect(() => {
    loadPoolState();
    // loadPoolResultsHistory()
  }, []);

  useEffect(() => {
    navigation.setParams({ logout });
  }, [navigation, logout]);

  async function loadPoolState() {
    setIsFetchingPoolState(true);

    try {
      const response = await fetchPoolState();
      console.log(poolState);
      if (response.status === 200) {
        const { poolResultsHistory, totalSavings } = response.data;
        const poolState = {
          poolResultsHistory: poolResultsHistory.map((item) => ({
            id: item.id,
            winnerUsername: item.user.username,
            prize: item.amount,
            drawingTimestamp: item.createdAt,
          })),
          totalSavings: Number(totalSavings),
        };
        setPoolState(poolState);
        setHasPoolStateFetchError(false);
      }
    } catch (error) {
      setHasPoolStateFetchError(true);
    } finally {
      setIsFetchingPoolState(false);
    }
  }

  // async function loadPoolResultsHistory() {
  //   setIsFetchingPoolResultsHistory(true);

  //   try {
  //     const resultsHistory = await fetchPoolResultsHistory();

  //     setPoolResultsHistory(resultsHistory);
  //     setHasPoolResultsHistoryFetchError(false);
  //   } catch (error) {
  //     setHasPoolResultsHistoryFetchError(true);
  //   } finally {
  //     setIsFetchingPoolResultsHistory(false);
  //   }
  // }

  return (
    <View style={styles.rootViewContainer}>
      <SectionList
        contentContainerStyle={styles.contentContainer}
        sections={[
          {
            kind: SectionKind.ESTIMATED_PRIZE,
            data: [poolState],
            renderItem: () => {
              return (
                <View style={[styles.cardContainer, styles.viewSectionContainer]}>
                  <EstimatedPrizeSection
                    estimatedPrize={poolState?.estimatedPrize}
                    isFetching={isFetchingPoolState}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.COUNTDOWN,
            data: [poolState],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  {/* TODO: Un-hardcode this */}
                  <Text style={styles.countdownText}>Swym champion announced in 53 minutes.</Text>
                </View>
              );
            },
          },
          {
            kind: SectionKind.TOTAL_SAVINGS,
            data: [poolState],
            renderItem: () => {
              return (
                <View style={[styles.cardContainer, styles.viewSectionContainer]}>
                  <TotalSavingsSection
                    totalSavings={poolState?.totalSavings}
                    isFetching={isFetchingPoolState}
                  />
                </View>
              );
            },
          },
          {
            kind: SectionKind.POOL_HISTORY,
            data: [poolResultsHistory],
            renderItem: () => {
              return (
                <View style={[styles.cardContainer, styles.viewSectionContainer]}>
                  <PoolResultsHistoryCard
                    results={
                      poolState?.poolResultsHistory?.length ? poolState.poolResultsHistory : []
                    }
                    isFetching={isFetchingPoolState}
                  />
                </View>
              );
            },
          },
        ]}
        keyExtractor={sectionListItemKeyExtractor}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootViewContainer: {
    backgroundColor: Colors.blue,
    flex: 1,
  },

  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  cardContainer: {
    maxWidth: '100%',
    minWidth: '100%',
  },

  viewSectionContainer: {
    marginBottom: 20,
  },

  countdownText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: Colors.shadow1,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

PoolScreen.propTypes = {
  navigation: NavigationShape.isRequired,
  logout: PropTypes.func,
};

PoolScreen.defaultProps = {};

PoolScreen.navigationOptions = ({ route }) => {
  return {
    header: () => {
      return <Navbar title="Pool" logout={route.params && route.params.logout} />;
    },
  };
};

export default PoolScreen;
