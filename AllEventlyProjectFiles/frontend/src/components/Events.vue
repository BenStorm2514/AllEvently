<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Event } from '@/types/EventInterface';
import TopPanel from "@/components/TopPanel.vue";
import Sidebar from "./Sidebar.vue";
import logo from '@/assets/AllEventlyLogo.png';
import SearchBar from "@/components/SearchBar.vue";
import EventCard from './EventCard.vue';
import router from "@/router";

const activeTab = ref('attending');
const filterOption = ref('Upcoming Events');
const isSidebarVisible = ref(true);
const sidebarWidth = ref(200);
const userId = ref<string | null>(localStorage.getItem('userId'));
const hostedEvents = ref<Event[]>([]);
const publicEvents = ref<Event[]>([]);

// Ensure `currentUser` has valid data fetched from the API
const firstName = ref<string>("Joh"); // Replace with actual dynamic data
const lastName = ref<string>("Doe");   // Replace with actual dynamic data
const email = ref<string>("john.doe@example.com"); // Replace with actual dynamic data

const getCurrentUser = async () => {
  try {
    console.log('Fetching current user with userId:', userId.value); // Log the userId
    const response = await fetch('https://all-evently-backend.vercel.app/api/currentuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId.value
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (!data.user){
        alert(data.user);
      } else {
        const userData = data.user.split(",");
        email.value = userData[0];
        firstName.value = userData[1];
        lastName.value = userData[2];
        email.value = email.value.replace(/\(/g, "");
        lastName.value = lastName.value.replace(/\)/g, "");
        localStorage.setItem('firstName', firstName.value);
        localStorage.setItem('lastName', lastName.value);
        localStorage.setItem('email', email.value);
      }
    } else {
      console.error('Error fetching current user');
    }

  } catch (error) {
    console.log("Error message: ")
    console.log(error);
  }
}

const getPublicEvents = async () => {
  try {
    console.log('Fetching public events...');
    const response = await fetch('https://all-evently-backend.vercel.app/api/publicevents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Received data: ", data);  // Debugging the response

      if (Array.isArray(data) && data.length > 0) {
        publicEvents.value = data.map((item: any) => ({
          id: item.event_id,
          title: item.event_name,
          type: item.location,
          venue: item.event_address,
          date: item.event_date,
          time: item.updated_at,
          host: item.email,
          imageUrl: '',
          venueLink: '',
          venueAddress: item.event_address,
          isHost: item.is_active,
          isGuest: item.is_published,
        }));
        console.log("Public events stored: ", publicEvents.value);
      } else {
        console.log("No public events to display.");
        publicEvents.value = [];
      }
    } else {
      console.error("Error fetching public events. Status:", response.status);
    }
  } catch (error) {
    console.error("Error during fetch operation: ", error);
  }
};

const getHostedEvents = async () => {
  try {
    console.log('Fetching hosted events...');
    const response = await fetch('https://all-evently-backend.vercel.app/api/hostedevents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value, // Use the user's email to fetch hosted events
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Hosted events received: ", data);

      if (Array.isArray(data) && data.length > 0) {
        hostedEvents.value = data.map((item: any) => ({
          id: item.event_id,
          title: item.event_name,
          type: item.location, // Adjust field mapping based on your backend response
          venue: item.event_address,
          date: item.event_date,
          time: item.updated_at,
          host: item.email,
          imageUrl: '', // Placeholder
          venueLink: '', // Placeholder
          venueAddress: item.event_address,
          isHost: true, // Hosted events are always hosted by the current user
          isGuest: false,
        }));
        console.log("Hosted events stored: ", hostedEvents.value);
      } else {
        console.log("No hosted events to display.");
        hostedEvents.value = []; // Clear out hosted events if none are returned
      }
    } else {
      console.error('Error fetching hosted events:', response.status);
    }
  } catch (error) {
    console.error("Error during fetch operation:", error);
  }
};

const updateSidebarWidth = () => {
  sidebarWidth.value = window.innerWidth <= 809 ? 80 : 200;
};
window.addEventListener('resize', updateSidebarWidth);

const currentUser = ref<string>(''); // Empty string initially

onMounted(async () => {
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  localStorage.removeItem('email');
  console.log('onMounted triggered for Events.vue');
  if (!userId.value) {
    console.error('No userId found. Redirecting to login.');
    await router.push({ name: 'Login' }); // Redirect to login
    return;
  }

  if (publicEvents.value.length === 0 && hostedEvents.value.length === 0) {
    await getCurrentUser();   // Fetch user details
    await getPublicEvents();  // Fetch public events
    await getHostedEvents();  // Fetch hosted events
  } else {
    console.log('Public events already fetched, skipping API call.');
  }

  updateSidebarWidth();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSidebarWidth);
});

//Commenting out hard-coded events and testing it with data from the server request
// Event list
/*
const events = ref<Event[]>([
  {
    id: 1,
    title: "Lisa's Baby Shower",
    type: 'public',
    venue: 'Wilma Rudolph Event Center',
    date: 'Sep 28, 2024',
    time: '3:00 PM CDT',
    host: 'Guest',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1711638374362-a26eb6bbb281?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFieXNob3dlcnxlbnwwfHwwfHx8MA%3D%3D',
    venueLink: 'www.google.com',
    venueAddress: "8 Champion's Wy, Clarksville, TN 37040",
  },
  {
    id: 2,
    title: "Jonie's Birthday",
    type: 'public',
    venue: 'Smith-Trahern Mansion',
    date: 'Oct 5, 2024',
    time: '6:00 PM CDT',
    host: 'Alice',
    imageUrl: 'https://i0.wp.com/ajp.com.au/wp-content/uploads/2022/02/52195073_m.jpg?w=2024&ssl=1',
    venueLink: 'www.google.com',
    venueAddress: '101 McClure Street, Clarksville, TN 37040',
  },
  {
    id: 3,
    title: "Carson's Bounce Party",
    type: 'public',
    venue: 'Sky Zone',
    date: 'Oct 21, 2024',
    time: '12:00 PM',
    host: 'Sue',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/64d3a0ef20f2a13ff24d687f/91c71c0b-4778-4151-a67c-cb3b9fbe772c/IMG_6505-Pano-Edit_120.jpg',
    venueLink: 'www.google.com',
    venueAddress: '310 Needmore Rd, Clarksville, TN 37040',
  }
]);
*/

// Processed events with dynamic isHost and isGuest
const processedEvents = computed(() =>
  hostedEvents.value.map(event => ({
    ...event,
    isHost: event.host === currentUser.value,
    isGuest: event.host !== currentUser.value,
  }))
);

// Filtered events based on the active tab
const filteredEvents = computed(() => {
  if (activeTab.value === 'hosting') {
    return hostedEvents.value; // Show hosted events
  } else if (activeTab.value === 'attending') {
    return processedEvents.value.filter(event => event.isGuest);
  }
  return processedEvents.value;
});

const navItems = [
  { label: 'Account', path: '/account', icon: 'fas fa-user',
    query: { firstName: firstName.value, lastName: lastName.value, email: email.value } },
  { label: 'Public Events', path: '/public', icon: 'fas fa-users',
    query: { email: <string>email.value } },
  { label: 'Events', path: '/events', icon: 'fas fa-calendar-alt' },
  { label: 'Logout', path: '/', icon: 'fas fa-right-from-bracket' }
];

</script>

<template>
  <div class="page-layout events-page">
    <TopPanel :logo="logo" />
    <Sidebar
        :isVisible="isSidebarVisible"
        :width="sidebarWidth"
        :NavItems = "navItems"
    />
    <!-- Main content area -->
    <main class="content-area events-content">
      <div>
        <div class="content-header">
          <h1 class="main-title">Events</h1>
          <div class="tabs">
            <button
              :class="{ active: activeTab === 'attending' }"
              @click="activeTab = 'attending'"
            >
              Attending
            </button>
            <button
              :class="{ active: activeTab === 'hosting' }"
              @click="activeTab = 'hosting'"
            >
              Hosting
            </button>
          </div>
          <div class="filters">
            <SearchBar />
            <select v-model="filterOption">
              <option>Upcoming Events</option>
            </select>
          </div>
        </div>
        <section class="event-listings">
          <EventCard
            v-for="event in filteredEvents"
            :key="event.id"
            :event="event"
            :isHost="event.isHost"
            :isGuest="event.isGuest"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import '@/styles/common.css';

.content-header .main-title {
  margin-top: 25px;
  font-size: 4rem; /* Adjust to your desired size */
  font-weight: bold; /* Optional: Keep it bold or adjust */
  margin-bottom: 10px; /* Optional: Adjust spacing around the title */
}

.event-listings {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 10px;
  justify-content: flex-start; /* Align buttons to the left */
  margin-bottom: 20px;
}

.tabs button {
  padding: 15px 30px; /* Height(px), Width(px) */
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #FF6B35;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: transform 0.2s, background-color 0.3s;
}

.tabs button:hover {
  background-color: #D9432C;
  transform: scale(1.05);
}

.tabs button.active {
  background-color: #E63946;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);
}

/* Filters Section */
.filters {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.filters input[type="text"],
.filters select {
  font-size: 1rem;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: box-shadow 0.3s, border-color 0.3s;
  flex: 1;
  width: 267px; /* Fixed width */
  min-width: 267px; /* Ensures it doesn't shrink below 267px */
  max-width: 267px;
}

.filters input[type="text"]:focus,
.filters select:focus {
  border-color: #E63946;
  box-shadow: 0 0 8px rgba(230, 57, 70, 0.4);
}

/* Buttons */
button {
  font-size: 1rem;
  padding: 10px 20px;
  background-color: #FF6B35;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

button:hover {
  background-color: #D9432C;
  transform: scale(1.05);
}

.filters input[type="text"]:focus,
.filters select:focus {
  border-color: #E63946;
  box-shadow: 0 0 8px rgba(230, 57, 70, 0.4);
}

@media screen and (max-width: 768px) {
  .filters {
    flex-direction: column; /* Stack items vertically */
    align-items: stretch; /* Make items fill the container width */
  }

  .filters input[type="text"],
  .filters select {
    width: 100%; /* Full width for smaller screens */
    margin-bottom: 10px; /* Add spacing between stacked items */
  }

  .tabs button {
    padding: 10px 20px; /* Adjust padding for smaller screens */
    font-size: 1rem; /* Reduce font size */
  }
}

.event-listings {
  gap: 10px; /* Adjust gap for smaller screens */
}

.tabs {
  flex-wrap: wrap; /* Allow buttons to wrap for smaller screens */
  justify-content: flex-start; /* Center tabs on smaller screens */
  gap: 5px; /* Reduce spacing */
}
</style>