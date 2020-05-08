<template>
  <q-card
    max-width="400"
    max-height="600px"
    rounded
    :elevation="8"
  >
    <q-card-section class="toonin-title">{{ cardTitle }}</q-card-section>
    <q-img
      contain
      src="../assets/icon.png"
      style="margin-top: 1%; padding-top: 20px;max-height:240px"
    />
    <q-card-section class="text--primary">
      <q-input
        v-show="
          connectedStatus === 'disconnected' || connectedStatus === 'failed'
        "
        v-model="roomName"
        style="color: white;"
        autofocus
        @keydown.enter="toonin"
        placeholder="Room Key"
        outlined
        rounded
        :error="errorMessages.length > 0"
      >
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
    </q-card-section>
    <q-card-actions align="center">
      <q-btn
        @click="handleTooninButtonClick"
        class="btn-share pr-4"
        :color='connectedStatus === "connected" ? "warning": "primary"'
        outline
        rounded
        :disabled="sharing"
      >
        <q-icon
          v-if="connectedStatus === 'connected'"
          name="mdi-stop"
          left
        />
        <toonin-icon
          v-else
          left
        ></toonin-icon>
        {{ buttonStatus }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { StartShare } from '../host'
import TooninIcon from './TooninIcon'
const SUCCESSFUL = 'connected'
const DISCONNECTED = 'disconnected'
const FAILED = 'failed'

/* eslint no-console: ["error", { allow: ["log"] }] */

export default {
  name: 'connect-to-room',
  props: {},
  components: {
    TooninIcon
  },
  data () {
    return {
      roomName: null,
      targetHost: '',
      failedHosts: [],
      errors: []
    }
  },
  methods: {
    handleTooninButtonClick () {
      if (this.connectedStatus === 'connected') {
        this.disconnect()
      } else this.toonin()
    },
    toonin () {
      this.connectToRoom()
    },
    connectToRoom (reconnecting) {
      this.$store.dispatch('UPDATE_ROOM', this.roomName)
      if (!reconnecting) {
        this.$store.dispatch('UPDATE_PEERS', new StartShare(this, false))
      } else {
        console.log('reconnecting')
        this.peers.getSocket().emit('new peer', this.roomName)
      }
    },
    evaluateHosts (hostPool) {
      for (var i = 0; i < hostPool.length; i++) {
        if (!this.failedHosts.includes(hostPool[i].socketID)) {
          return { hostFound: true, selectedHost: hostPool[i].socketID }
        }
      }
    },
    attachRTCliteners () {
      this.rtcConn.onconnectionstatechange = () => {
        if (this.rtcConn.connectionState === SUCCESSFUL) {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.roomName = ''
          try {
            this.rtcConn.createDataChannel('mediaDescription')
          } catch (err) {
            console.log(err)
          }
        }

        if (
          this.rtcConn.connectionState === DISCONNECTED ||
          this.rtcConn.connectionState === FAILED
        ) {
          console.log('Connection failed')
          // this.failedHosts.push(this.targetHost)
          this.reconnect()

          this.$store.dispatch('UPDATE_CONNECTED_STATUS', DISCONNECTED)
          this.$store.dispatch('UPDATE_ROOM', '')
          this.$store.dispatch('UPDATE_STREAM_TITLE', '')
          this.$store.dispatch('UPDATE_PLAYING', false)
          this.$store.dispatch('UPDATE_RTCCONN', null)
          this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
          this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
          this.targetHost = ''
        }
      }

      this.rtcConn.ondatachannel = event => {
        var channel = event.channel
        channel.onmessage = this.onDataChannelMsg
      }

      this.rtcConn.ontrack = event => {
        var incomingStream = new MediaStream([event.track])
        this.peers.updateOutgoingTracks(event.track)

        var _iOSDevice = !!navigator.platform.match(
          /iPhone|iPod|iPad|Macintosh|MacIntel/
        )

        if (_iOSDevice) {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.$store.dispatch('UPDATE_PLAYING', false)

          if (incomingStream.getVideoTracks().length > 0) {
            this.$store.dispatch('UPDATE_VIDEO_STREAM', incomingStream)
          } else {
            this.$store.dispatch('UPDATE_AUDIO_STREAM', incomingStream)
          }
        } else {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.$store.dispatch('UPDATE_PLAYING', true)

          if (incomingStream.getVideoTracks().length > 0) {
            this.$store.dispatch('UPDATE_VIDEO_STREAM', incomingStream)
          } else {
            this.$store.dispatch('UPDATE_AUDIO_STREAM', incomingStream)
          }
        }
      }
    },
    onDataChannelMsg (messageEvent) {
      // data channel to recieve the media title
      try {
        if (messageEvent.data === 'close') {
          this.disconnect()
          return
        }
        this.peers.dataChannelMsgEvent(messageEvent.data)
        var mediaDescription = JSON.parse(messageEvent.data)
        this.$store.dispatch('UPDATE_STREAM_TITLE', mediaDescription.title)
      } catch (err) {
        this.logMessage()
      }
    },
    logMessage () {
      // continue regardless of error
    },
    reconnect () {
      this.rtcConn.close()
      this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
      this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
      this.$store.dispatch('UPDATE_RTCCONN', null)

      var roomKey = this.$store.getters.ROOM
      this.roomName = roomKey
      this.connectToRoom(false)
    },
    async disconnect () {
      this.rtcConn.close()
      await this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
      this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
      this.$store.dispatch('UPDATE_CONNECTED_STATUS', DISCONNECTED)
      this.$store.dispatch('UPDATE_ROOM', '')
      this.$store.dispatch('UPDATE_PEERID', null)
      this.$store.dispatch('UPDATE_STREAM_TITLE', '')
      this.$store.dispatch('UPDATE_PLAYING', false)
      this.$store.dispatch('UPDATE_RTCCONN', null)
      this.$store.dispatch('UPDATE_PEERS', null)
      this.targetHost = ''
      this.failedHosts = []
    }
  },
  computed: {
    buttonStatus () {
      if (this.connectedStatus === 'connected') {
        return 'Disconnect'
      }
      return 'Toonin'
    },
    cardTitle () {
      if (this.connectedStatus === 'connected') {
        return `Connected to ${this.room}`
      }
      return 'Connect to a room'
    },
    errorMessages () {
      if (this.errors > 0) {
        return this.errors
      } else if (this.sharing) {
        return ['Already sharing in a room.']
      } else {
        return this.errors
      }
    },
    ...mapState([
      'room',
      'rtcConn',
      'streamTitle',
      'playing',
      'connectedStatus',
      'peerID',
      'audioStream',
      'videoStream',
      'sharing',
      'peers',
      'name'
    ])
  },
  mounted: function () {
    if (this.$route.params.room) {
      this.roomName = this.$route.params.room
      setTimeout(() => this.toonin(), 500)
    }
    window.onbeforeunload = function () {
      if (this.room) {
        this.peers.socket.emit('logoff', {
          room: this.$store.getters.ROOM,
          socketID: this.peers.getSocket().id,
          name: this.$store.getters.NAME
        })
      }
      return null
    }
  }
}
</script>

<style>
div.q-input {
  width: 100%;
  margin-right: 0%;
}
</style>