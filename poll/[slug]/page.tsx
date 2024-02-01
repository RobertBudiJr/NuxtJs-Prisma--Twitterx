'use client';

import React, { useState, useEffect, useReducer } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import Container from 'react-bootstrap/Container';
import IconBack from '@/assets/images/icons/icon-arrow-left.svg';
import IconClose from '@/assets/images/icons/icon-close.svg';
import IconShare from '@/assets/images/icons/icon-share.svg';
import AppLogo from '@/assets/images/app-logo-no-text.png';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { callAPI } from '@/lib/axiosHelper';
import useFetch from '@/hooks/useFetch';
import { error } from 'console';

const Button = dynamic(() => import('@/app/components/button'), { ssr: false });
const SplashScreen = dynamic(() => import('@/app/components/splashScreen'), { ssr: false });

const Main = ({ slug }: { slug: string }) => {
  /**
   * * Important Function for Fetching and Initial Data
   */
  const router = useRouter();
  const { data: session, status } = useSession();
  // Initialize bypassToken with false
  const [bypassToken, setBypassToken] = useState(false);

  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState(false);
  const [pollDataFromApis, setPollDataFromApis] = useState<any>(null);
  // const [pollDataFromApis, dispatch] = useReducer(pollDataReducer, null);
  const [userPoll, setUserPoll] = useState<any>(null);
  const [pollDataChoiceUser, setPollDataChoiceUser] = useState<any>(null);
  const [payloadData, setPayloadData] = useState<any>({
    id_user_poll: null,
    id_user: session?.user?.id ? session?.user?.id : null,
    id_poll: null,
    id_poll_list_choice: null,
    soft_delete: 0,
  });
  const slugPoll = slug;
  // console.log("slugPoll : ", slugPoll)

  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState(-1);

  const [disabled, setDisabled] = useState(false);

  // Function to navigate back using the router
  const handleGoBack = () => {
    router.back();
  };
  const handleGoHomepage = () => {
    router.push('/');
  };

  // Function to handle choice selection
  const handleChoiceSelect = (choiceIndex: number) => {
    // console.log("id_poll_list_choice selected from button : ", choiceIndex);
    // Find the chosen choice by matching id_poll_list_choice
    const chosenChoice = pollDataFromApis.choices.findIndex((choice: any) => choice.id_poll_list_choice === choiceIndex);
    // console.log("chosenChoice : ", chosenChoice);

    if (currentPhase === 1) {
      // User is selecting their initial choice
      setSelectedChoice(choiceIndex);
      const chosenChoice = pollDataFromApis.choices.find((choice: any) => choice.id_poll_list_choice === choiceIndex);

      if (chosenChoice) {
        // Increment poll_count for the chosen choice
        chosenChoice.poll_count += 1;

        // Recalculate percentages
        const totalVotes = pollDataFromApis.choices.reduce((accumulator: any, choice: any) => accumulator + choice.poll_count, 0);

        pollDataFromApis.choices.forEach((choice: any) => {
          choice.percentage = (choice.poll_count / totalVotes) * 100;
        });

        // Update state with the new data
        setPollDataFromApis((prevData: any) => ({
          ...prevData,
          choices: [...prevData.choices], // Create a new array to trigger re-render
          totalVotes,
        }));
      }

      if (status === 'authenticated') {
        // Handle the rest of your logic (e.g., submitting the choice)
        handleSubmitPoll(choiceIndex);
        fetchData(true);
      }

      setCurrentPhase(2);
    } else if (currentPhase === 2 && selectedChoice !== choiceIndex) {
      // User is changing their choice
      const prevChoice = pollDataFromApis.choices.find((choice: any) => choice.id_poll_list_choice === selectedChoice);
      const newChoice = pollDataFromApis.choices.find((choice: any) => choice.id_poll_list_choice === choiceIndex);

      if (prevChoice && newChoice) {
        // Decrease poll_count for the previously selected choice
        prevChoice.poll_count -= 1;
        // Increase poll_count for the newly selected choice
        newChoice.poll_count += 1;

        // Recalculate percentages
        const totalVotes = pollDataFromApis.choices.reduce((accumulator: any, choice: any) => accumulator + choice.poll_count, 0);

        pollDataFromApis.choices.forEach((choice: any) => {
          choice.percentage = (choice.poll_count / totalVotes) * 100;
        });

        // Update state with the new data
        setPollDataFromApis((prevData: any) => ({
          ...prevData,
          choices: [...prevData.choices], // Create a new array to trigger re-render
          totalVotes,
        }));
      }

      // Now, handle the rest of your logic for Phase 2
      setSelectedChoice(choiceIndex); // Update the selected choice
      if (status === 'authenticated') {
        // Handle the rest of your logic (e.g., submitting the choice)
        handleSubmitPoll(choiceIndex);
        fetchData(true);
      }
    }
  };

  const handleSubmitPoll = async (choiceIndex: any) => {
    if (!disabled) {
      const updatedPayloadData = {
        ...payloadData,
        id_poll_list_choice: choiceIndex, // Use the passed updatedAnswers
      };
      setDisabled(true);
      // console.log("updatedPayloadData data : ", updatedPayloadData);
      const { data, ok, error } = await callAPI('/user-poll/create-edit', 'POST', updatedPayloadData, true);
      if (ok && data) {
        setDisabled(false);
        // console.log("submitted data : ", data);
      }
      if (error) {
        // console.log("error submitted data : ", error);
      }
    }
  };

  const handleUserPollAlreadySubmitted = async (userPoll: any) => {
    // console.log("userPoll.data on handleUserPollAlreadySubmitted : ", userPoll.data);

    if (Array.isArray(userPoll.data.data)) {
      userPoll.data.data.forEach((data: any) => {
        // console.log('data', data)
        if (data.id_poll_list_choice != null) {
          setCurrentPhase(2);
          // Extract the id_poll_list_choice from the current data item
          const idPollListChoice = data.id_poll_list_choice;
          // Find the chosen choice by matching id_poll_list_choice
          const chosenChoice = pollDataFromApis.choices.find((choice: any) => choice.id_poll_list_choice === idPollListChoice);
          // handleChoiceSelect(idPollListChoice)
          setSelectedChoice(idPollListChoice);
          // console.log("selectedChoice on handleUserPollAlreadySubmitted : " ,selectedChoice);
        }
      });
    }
  };

  useEffect(() => {
    if (!userPoll) return;
    handleUserPollAlreadySubmitted(userPoll);
  }, [userPoll]);

  // Share Button Function
  const handleShare = async (title: string, slug: string) => {
    let sharePayload = {
      url: `https://popq.app/poll/${slug}`,
      title: 'See my Poll Result from PopQ App!',
      text: `I took this ${title} poll on PopQ check it out https://popq.app/poll/${slug} 🫶🥰`,
      icon: `${AppLogo}`,
    };

    try {
      if (navigator.share) {
        // Check if the Web Share API is available
        await navigator.share(sharePayload);
        console.log('Shared Successfully');
      } else {
        // Fallback if Web Share API is not available
        alert('Web Share API is not supported on this browser.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  /**
   * * Important Function for Fetching
   */
  let isInitialFetch = true; // Initialize the flag
  const fetchData = async (forceFetch = false) => {
    if (status === 'authenticated') {
      try {
        if (!forceFetch && pollDataFromApis && !isInitialFetch) {
          // Data is already set, no need to fetch again
          setLoadingPage(false);
          return;
        }
        // Define an array of API requests to be made concurrently
        const apiRequests = [callAPI('/user-poll/show', 'POST', { id_user: session?.user?.id, slug_poll: slugPoll, limit: 1, page: 1 }, true), callAPI('/poll/showById', 'POST', { slug: slugPoll }, true)];

        // Make all API calls concurrently using Promise.all
        const responses = await Promise.all(apiRequests);

        // Extract data from each response and set it in your state variables
        const [userPollFetched, pollDataFetched] = responses;

        setPollDataFromApis((prevData: any) => ({
          ...prevData,
          id_poll: pollDataFetched?.data?.id_poll,
          id_categories: pollDataFetched?.data?.id_categories,
          title: pollDataFetched?.data?.title,
          subtitle: pollDataFetched?.data?.description,
          category: pollDataFetched?.data?.subtitle,
          imgCard: pollDataFetched?.data?.thumbnail,
          categories: pollDataFetched?.data?.categories || [],
          choices:
            pollDataFetched?.data?.poll_list_choice.map((pollListChoice: any) => {
              const id_poll_list_choice = pollListChoice?.id_poll_list_choice;
              const text = pollListChoice?.poll_choice;
              const percentage = pollListChoice?.percentage;
              const poll_count = pollListChoice?.poll_count;

              return {
                id_poll_list_choice,
                text,
                percentage,
                poll_count,
              };
            }) || [],
          totalVotes: pollDataFetched?.data?.poll_list_choice.reduce((accumulator: number, pollListChoice: any) => accumulator + (pollListChoice?.poll_count || 0), 0),
        }));
        setPayloadData((prevPayloadData: any) => ({
          ...prevPayloadData,
          id_poll: pollDataFetched?.data?.id_poll,
        }));
        setUserPoll(userPollFetched);
        setLoadingPage(false);
        isInitialFetch = false; // Update the flag after the initial fetch
      } catch (error) {
        setErrorPage(true);
        setLoadingPage(false);
      }
    } else if (status === 'unauthenticated' && bypassToken) {
      try {
        if (!forceFetch && pollDataFromApis && !isInitialFetch) {
          // Data is already set, no need to fetch again
          setLoadingPage(false);
          return;
        }
        // Define an array of API requests to be made concurrently
        const apiRequests = [callAPI('/poll/showById', 'POST', { slug: slugPoll }, true)];

        // Make all API calls concurrently using Promise.all
        const responses = await Promise.all(apiRequests);

        // Extract data from each response and set it in your state variables
        const [pollDataFetched] = responses;

        setPollDataFromApis((prevData: any) => ({
          ...prevData,
          id_poll: pollDataFetched?.data?.id_poll,
          id_categories: pollDataFetched?.data?.id_categories,
          title: pollDataFetched?.data?.title,
          subtitle: pollDataFetched?.data?.description,
          category: pollDataFetched?.data?.subtitle,
          imgCard: pollDataFetched?.data?.thumbnail,
          categories: pollDataFetched?.data?.categories || [],
          choices:
            pollDataFetched?.data?.poll_list_choice.map((pollListChoice: any) => {
              const id_poll_list_choice = pollListChoice?.id_poll_list_choice;
              const text = pollListChoice?.poll_choice;
              const percentage = pollListChoice?.percentage;
              const poll_count = pollListChoice?.poll_count;

              return {
                id_poll_list_choice,
                text,
                percentage,
                poll_count,
              };
            }) || [],
          totalVotes: pollDataFetched?.data?.poll_list_choice.reduce((accumulator: number, pollListChoice: any) => accumulator + (pollListChoice?.poll_count || 0), 0),
        }));
        setLoadingPage(false);
        isInitialFetch = false; // Update the flag after the initial fetch
      } catch (error) {
        setErrorPage(true);
        setLoadingPage(false);
      }
    }
  };

  useEffect(() => {
    const bypassData = localStorage.getItem('bypassLogin');
    // console.log('bypassData : ', bypassData);
    if (bypassData) {
      const parsedData = JSON.parse(bypassData);
      // console.log('parsedData : ', parsedData);
      const dateTime = new Date().getTime();
      // console.log('parsedData.flag : ', parsedData.flag);
      if (parsedData.flag === 'true' && dateTime < parsedData.expires) {
        setBypassToken(true);
      } else {
        setBypassToken(false);
      }
    } else if (status === 'unauthenticated' && !bypassToken) {
      router.push('/signin');
    }
  }, []);

  useEffect(() => {
    if (bypassToken || status === 'authenticated') {
      fetchData();
    }
  }, [bypassToken]);

  if (loadingPage && status === 'unauthenticated' && !bypassToken) {
    return <SplashScreen />;
  }

  if (errorPage) {
    return <div>Error Fetching Data</div>;
  }

  // console.log("userPoll : ", userPoll)
  console.log('pollDataFromApis : ', pollDataFromApis);
  // console.log("payloadData : ", payloadData)

  return (
    <>
      {/* Section Header */}
      <section>
        <Container className={styles.headerWrap}>
          <button onClick={handleGoBack} type='button' className='btn-icon' aria-label='quizBack'>
            <IconBack className={`svgr-icon ${styles.iconBack}`} />
          </button>
          <button onClick={handleGoHomepage} type='button' className='btn-icon' aria-label='quizClose'>
            <IconClose className={`svgr-icon btn-close ${styles.iconClose}`} />
          </button>
        </Container>
      </section>
      {/* Section Body */}
      <section className={`card-height ${styles.bodyPolls}`}>
        <div className={styles.bodyBg}></div>
        <Container className={styles.bodyWrap}>
          <Image className={styles.logoImg} src={AppLogo} alt='Live Poll Logo' width={104} height={104} />
          <p className={styles.statement}>{pollDataFromApis?.title ? pollDataFromApis?.title : 'Loading...'}</p>
          <div className={styles.choicesWrap}>
            {currentPhase === 1 && (
              <>
                {pollDataFromApis
                  ? pollDataFromApis.choices.map((choice: any, index: number) => (
                      <button type='button' disabled={disabled} key={choice.id_poll_list_choice} className={styles.choiceButton} onClick={() => handleChoiceSelect(choice.id_poll_list_choice)} value={choice.text}>
                        <p className={styles.choiceText}>{choice.text}</p>
                      </button>
                    ))
                  : // Render four disabled buttons while waiting for data
                    Array.from({ length: 4 }).map((_, index) => (
                      <button key={index} className={styles.choiceButton} disabled>
                        <p className={styles.choiceText}>Loading...</p>
                      </button>
                    ))}
              </>
            )}
            {currentPhase === 2 && (
              <>
                {pollDataFromApis?.choices.map((choice: any, index: number) => (
                  <button
                    type='button'
                    disabled={disabled}
                    key={choice.id_poll_list_choice}
                    className={`${styles.choiceButton} ${styles.choiceResult} ${selectedChoice === choice.id_poll_list_choice ? styles.selectedChoice : ''}`}
                    onClick={() => handleChoiceSelect(choice.id_poll_list_choice)}>
                    <p className={styles.choiceText}>{choice.text}</p>
                    <p className={styles.percentageText}>{Number.isInteger(choice.percentage) ? `${choice.percentage}%` : choice.percentage.toFixed(1) + '%'}</p>
                  </button>
                ))}
                <p className={styles.totalVotes}>{pollDataFromApis?.totalVotes} Votes</p>
                <div className={styles.buttonWrap}>
                  <Button btnText='Done' btnType='primary' textColor='White' href={'/'}>
                    <p className={styles.btnDone}>Done</p>
                  </Button>
                  <button type='button' className={styles.btnShare} onClick={() => handleShare(pollDataFromApis?.title, slugPoll)}>
                    <IconShare className={`svgr-icon ${styles.iconShare}`} />
                  </button>
                </div>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

const Page = async ({ params: { slug } }: { params: { slug: string } }) => {
  return <Main slug={slug} />;
};

export default Page;
